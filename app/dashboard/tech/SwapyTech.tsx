"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  createSwapy,
  utils,
  type Swapy,
  type SlotItemMapArray,
} from "swapy";
import { DotsSixVertical } from "@phosphor-icons/react";
import type { TechStack } from "@/lib/database.types";
import { saveTech, deleteTech, reorderTech } from "../actions";
import { Field, Input, SaveButton, DeleteButton, Card } from "../ui";
import { FileInput } from "../FileInput";

function TechForm({ tech }: { tech?: TechStack }) {
  return (
    <form action={saveTech} className="flex flex-col gap-4">
      {tech && <input type="hidden" name="id" value={tech.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug (e.g. react)">
          <Input name="slug" defaultValue={tech?.slug ?? ""} required />
        </Field>
        <Field label="Display name">
          <Input name="name" defaultValue={tech?.name ?? ""} required />
        </Field>
        <Field label="Logo URL">
          <Input name="logo_url" defaultValue={tech?.logo_url ?? ""} />
        </Field>
        <Field label="…or upload logo (takes priority)">
          <FileInput name="logo_file" />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="needs_inversion"
          defaultChecked={tech?.needs_inversion ?? false}
        />
        Invert in dark mode
      </label>
      <SaveButton>{tech ? "Save" : "Add tech"}</SaveButton>
    </form>
  );
}

export function SwapyTech({ techs }: { techs: TechStack[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<Swapy | null>(null);
  const [, startTransition] = useTransition();
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(
    utils.initSlotItemMap(techs, "id"),
  );

  const slottedItems = utils.toSlottedItems(techs, "id", slotItemMap);

  // Keep the slot map in sync when items are added or removed.
  useEffect(() => {
    utils.dynamicSwapy(
      swapyRef.current,
      techs,
      "id",
      slotItemMap,
      setSlotItemMap,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techs]);

  useEffect(() => {
    const swapy = createSwapy(containerRef.current!, {
      manualSwap: true,
      animation: "dynamic",
    });
    swapyRef.current = swapy;
    swapy.onSwap((event) => setSlotItemMap(event.newSlotItemMap.asArray));
    swapy.onSwapEnd((event) => {
      if (!event.hasChanged) return;
      const order = event.slotItemMap.asArray.map((s) => s.item);
      startTransition(() => reorderTech(order));
    });
    return () => swapy.destroy();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <details>
        <summary className="cursor-pointer text-sm font-medium text-accent">
          + Add new tech
        </summary>
        <div className="mt-4">
          <Card>
            <TechForm />
          </Card>
        </div>
      </details>

      <div ref={containerRef} className="flex flex-col gap-3">
        {slottedItems.map(({ slotId, itemId, item }) => (
          <div key={slotId} data-swapy-slot={slotId}>
            {item && (
              <div data-swapy-item={itemId}>
                <Card>
                  <details name="tech">
                    <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                      {item.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.logo_url}
                          alt=""
                          aria-hidden
                          className="size-5 object-contain"
                        />
                      )}
                      <span className="flex-1 font-medium">{item.name}</span>
                      <span
                        data-swapy-handle
                        onClick={(e) => e.preventDefault()}
                        aria-label="Drag to reorder"
                        className="cursor-grab rounded-md p-1 text-muted transition-colors hover:text-foreground active:cursor-grabbing"
                      >
                        <DotsSixVertical weight="bold" className="size-5" />
                      </span>
                    </summary>
                    <div className="mt-4 flex flex-col gap-4">
                      <TechForm tech={item} />
                      <form action={deleteTech}>
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteButton>Delete tech</DeleteButton>
                      </form>
                    </div>
                  </details>
                </Card>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
