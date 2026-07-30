import { useMemo, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ImageUpload";

export type ListingModule = "experience" | "dish" | "property" | "transport" | "specialRequest";
type FieldType = "text" | "number" | "textarea" | "select" | "time" | "tags";

export interface ListingField {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface ListingSchema {
  title: string;
  photoLabel: string;
  maxPhotos: number;
  fields: ListingField[];
}

export const listingSchemas: Record<ListingModule, ListingSchema> = {
  experience: {
    title: "Experience",
    photoLabel: "Experience gallery",
    maxPhotos: 6,
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "category", label: "Category", type: "select", options: ["Cultural", "Food", "Spiritual", "Wellness", "Adventure", "Wedding", "Village", "Festival", "Bike Tour"], required: true },
      { key: "location", label: "Location", required: true },
      { key: "meetingPoint", label: "Meeting point", required: true },
      { key: "price", label: "Price (₹)", type: "number", required: true },
      { key: "priceType", label: "Price type", type: "select", options: ["Per person", "Per group", "Per day"], required: true },
      { key: "duration", label: "Duration", placeholder: "e.g. 4 hours", required: true },
      { key: "maxGuests", label: "Maximum guests", type: "number", required: true },
      { key: "languages", label: "Languages", type: "tags", placeholder: "English, Hindi" },
      { key: "highlights", label: "Highlights", type: "tags" },
      { key: "includes", label: "What is included", type: "tags" },
      { key: "cancellationPolicy", label: "Cancellation policy", type: "textarea", required: true },
      { key: "availability", label: "Availability", placeholder: "e.g. Mon–Sat, 8am–5pm", required: true },
    ],
  },
  dish: {
    title: "Dish",
    photoLabel: "Dish photos",
    maxPhotos: 4,
    fields: [
      { key: "name", label: "Dish name", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "cuisine", label: "Cuisine", required: true },
      { key: "mealType", label: "Meal type", type: "select", options: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"], required: true },
      { key: "dietaryTags", label: "Dietary tags", type: "tags", placeholder: "Vegetarian, Vegan, Jain" },
      { key: "serves", label: "Serves", type: "number", required: true },
      { key: "prepTime", label: "Preparation time", placeholder: "e.g. 30 minutes", required: true },
      { key: "pricePerPlate", label: "Price per plate (₹)", type: "number", required: true },
      { key: "allergenNotes", label: "Allergen notes", type: "textarea" },
      { key: "availability", label: "Availability", required: true },
    ],
  },
  property: {
    title: "Property",
    photoLabel: "Property photos",
    maxPhotos: 8,
    fields: [
      { key: "propertyName", label: "Property name", required: true },
      { key: "propertyType", label: "Property type", type: "select", options: ["Homestay", "Guesthouse", "Apartment", "Villa", "Farm stay", "Heritage home"], required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "location", label: "Location", required: true },
      { key: "amenities", label: "Amenities", type: "tags", placeholder: "Wi-Fi, Breakfast, Parking" },
      { key: "houseRules", label: "House rules", type: "textarea", required: true },
      { key: "nightlyRate", label: "Nightly rate (₹)", type: "number", required: true },
      { key: "weeklyRate", label: "Weekly rate (₹)", type: "number", required: true },
      { key: "maxGuests", label: "Maximum guests", type: "number", required: true },
      { key: "checkIn", label: "Check-in", type: "time", required: true },
      { key: "checkOut", label: "Check-out", type: "time", required: true },
      { key: "availability", label: "Availability", required: true },
    ],
  },
  transport: {
    title: "Transport",
    photoLabel: "Vehicle photos",
    maxPhotos: 5,
    fields: [
      { key: "type", label: "Vehicle type", type: "select", options: ["Car", "SUV", "Van", "Motorcycle", "Auto-rickshaw", "Mini bus"], required: true },
      { key: "model", label: "Make and model", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "capacity", label: "Passenger capacity", type: "number", required: true },
      { key: "pricePerDay", label: "Price per day (₹)", type: "number", required: true },
      { key: "pricePerKm", label: "Price per km (₹)", type: "number", required: true },
      { key: "serviceRadius", label: "Service radius (km)", type: "number", required: true },
      { key: "amenities", label: "Vehicle amenities", type: "tags", placeholder: "AC, Wi-Fi, Child seat" },
      { key: "availability", label: "Availability", required: true },
    ],
  },
  specialRequest: {
    title: "Special Request",
    photoLabel: "Reference photos",
    maxPhotos: 4,
    fields: [
      { key: "title", label: "Offering title", required: true },
      { key: "category", label: "Category", required: true },
      { key: "description", label: "Description", type: "textarea", required: true },
      { key: "price", label: "Starting price (₹)", type: "number", required: true },
      { key: "priceType", label: "Price type", type: "select", options: ["Fixed", "Per person", "Per day", "Quote required"], required: true },
      { key: "includes", label: "Includes", type: "tags" },
      { key: "availability", label: "Availability", required: true },
    ],
  },
};

interface ListingFormProps {
  module: ListingModule;
  userId: string;
  initialData?: Record<string, unknown>;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void> | void;
}

export default function ListingForm({ module, userId, initialData, onCancel, onSave }: ListingFormProps) {
  const schema = listingSchemas[module];
  const initial = useMemo(() => ({ ...initialData, images: Array.isArray(initialData?.images) ? initialData.images : [] }), [initialData]);
  const [data, setData] = useState<Record<string, any>>(initial);
  const [saving, setSaving] = useState(false);
  const images: string[] = Array.isArray(data.images) ? data.images : [];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try { await onSave({ ...data, imageUrl: images[0] || "", images }); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="text-lg font-bold text-foreground">{initialData ? "Edit" : "Add"} {schema.title}</h3><p className="text-xs text-muted-foreground">Complete required details before publishing.</p></div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="Close form"><X className="h-4 w-4" /></Button>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">{schema.photoLabel} *</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url, index) => (
            <ImageUpload key={`${url}-${index}`} bucket={module === "experience" ? "experience-images" : "trip-images"} folder={userId} currentUrl={url} onUpload={(next) => setData((old: any) => ({ ...old, images: next ? images.map((item, i) => i === index ? next : item) : images.filter((_, i) => i !== index) }))} className="aspect-square" />
          ))}
          {images.length < schema.maxPhotos && <ImageUpload bucket={module === "experience" ? "experience-images" : "trip-images"} folder={userId} onUpload={(url) => url && setData((old: any) => ({ ...old, images: [...images, url] }))} className="aspect-square" />}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">First photo is the cover · up to {schema.maxPhotos} photos</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {schema.fields.map((field) => (
          <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
            <label className="text-sm font-medium text-foreground">{field.label}{field.required ? " *" : ""}</label>
            {field.type === "textarea" ? <textarea className="mt-1 flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required={field.required} value={data[field.key] ?? ""} onChange={(e) => setData({ ...data, [field.key]: e.target.value })} />
              : field.type === "select" ? <select className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required={field.required} value={data[field.key] ?? ""} onChange={(e) => setData({ ...data, [field.key]: e.target.value })}><option value="">Select…</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>
              : <Input className="mt-1" type={field.type === "number" ? "number" : field.type === "time" ? "time" : "text"} min={field.type === "number" ? 0 : undefined} required={field.required} placeholder={field.type === "tags" ? field.placeholder || "Separate with commas" : field.placeholder} value={data[field.key] ?? ""} onChange={(e) => setData({ ...data, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })} />}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={saving || images.length === 0} className="gap-2"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save listing"}</Button></div>
    </form>
  );
}