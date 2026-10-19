export function Card({ title, img, onOpen }: { title: string; img: string; onOpen: () => void }) {
  return (
    <div className="rounded-lg shadow p-3 bg-white" onClick={onOpen}>
      <img src={img} className="w-full h-40 object-cover" />
      <div className="text-gray-400 text-sm mt-2">{title}</div>
    </div>
  );
}
