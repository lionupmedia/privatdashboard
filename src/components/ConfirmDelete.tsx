"use client";

import { TrashIcon } from "./icons";

export function ConfirmDelete({ action, id, name }: { action: (f: FormData) => void | Promise<void>; id: number; name: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Vertrag „${name}“ samt Dokumenten wirklich löschen?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-danger"><TrashIcon width={16} height={16} />Vertrag löschen</button>
    </form>
  );
}
