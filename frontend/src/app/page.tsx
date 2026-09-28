import StoreScene from "@/components/StoreScene";
import ApiStatus from "@/components/ApiStatus";

export default function Home() {
  return (
    <main className="relative h-screen w-screen">
      <StoreScene />
      <div className="absolute left-4 top-4 flex items-center gap-3">
        <h1 className="text-lg font-semibold text-zinc-900">food-3d-manager</h1>
        <ApiStatus />
      </div>
    </main>
  );
}
