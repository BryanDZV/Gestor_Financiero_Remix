import { Form, useNavigation, useSubmit, useActionData } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { MultiSelectActions } from "~/components/ui/multi-select-actions";
import { PageHeader } from "~/components/ui/page-header";
import { FormError } from "~/components/ui/form-error";
import { EmptyState } from "~/components/ui/empty-state";
import { Input } from "~/components/ui/input";
import { SubmitButton } from "~/components/ui/submit-button";
import type { CategoriesViewProps } from "~/types";

const ICON_OPTIONS = [
  "ph:shopping-cart-duotone", "ph:fork-knife-duotone", "ph:car-duotone", 
  "ph:house-duotone", "ph:lightning-duotone", "ph:heartbeat-duotone", 
  "ph:game-controller-duotone", "ph:airplane-tilt-duotone", 
  "ph:graduation-cap-duotone", "ph:tag-duotone", "ph:t-shirt-duotone", "ph:paw-print-duotone"
];

export function CategoriesView({ userEmail, categories }: CategoriesViewProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const isSubmitting = navigation.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      formRef.current?.reset();
      setIsDeleteMode(false);
      setSelectedCategories(new Set());
    }
  }, [navigation.state, actionData]);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader supertitle="Etiquetas" title="Categorías" description="Crea etiquetas visuales y aplícalas a tus gastos para las gráficas de análisis." />
          <div className="flex flex-wrap items-center gap-2">
            <MultiSelectActions
              isDeleteMode={isDeleteMode}
              selectedCount={selectedCategories.size}
              totalCount={categories.length}
              onToggleMode={setIsDeleteMode}
              onSelectAll={() => setSelectedCategories(new Set(categories.map(c => c.id)))}
              onClearSelection={() => setSelectedCategories(new Set())}
              onDelete={() => {
                const fd = new FormData();
                fd.append("_intent", "delete_categories");
                selectedCategories.forEach(id => fd.append("category_ids", id));
                submit(fd, { method: "post" });
              }}
              itemName="categoría(s)"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle className="text-base">Nueva Categoría</CardTitle><CardDescription>Ponle un nombre y elige un icono.</CardDescription></CardHeader>
              <CardContent>
                <Form ref={formRef} method="post" className="space-y-4">
                  <FormError error={actionData?.error} />
                  <input type="hidden" name="_intent" value="create_category" />
                  <Input type="text" name="name" placeholder="Ej. Supermercado..." required />
                  
                  <div className="space-y-1 mt-2 mb-2">
                    <label className="text-xs font-medium text-slate-500">Icono</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((icon) => (
                        <label key={icon} className="cursor-pointer">
                          <input type="radio" name="icon" value={icon} className="peer sr-only" defaultChecked={icon === "ph:tag-duotone"} />
                          <div className="rounded-xl border border-slate-200 p-2 text-slate-400 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600 transition-colors hover:bg-slate-50">
                            <Icon icon={icon} className="size-5" />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <SubmitButton isSubmitting={isSubmitting}>Guardar etiqueta</SubmitButton>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {categories.length === 0 ? (
              <EmptyState message="Aún no tienes categorías." />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.has(cat.id);
                  return (
                    <Card key={cat.id} className={`relative overflow-hidden transition-all hover:-translate-y-1 ${isDeleteMode && isSelected ? 'ring-2 ring-red-500' : ''}`} onClick={() => {
                      if (!isDeleteMode) return;
                      const newSet = new Set(selectedCategories);
                      newSet.has(cat.id) ? newSet.delete(cat.id) : newSet.add(cat.id);
                      setSelectedCategories(newSet);
                    }}>
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                        {isDeleteMode && isSelected && (<div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-md border-2 border-red-500 bg-red-500 text-white"><Icon icon="ph:check-bold" className="size-3" /></div>)}
                        <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-600"><Icon icon={cat.icon || "ph:tag-duotone"} className="size-8" /></div>
                        <h3 className="text-sm font-medium text-slate-900 line-clamp-2">{cat.name}</h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}