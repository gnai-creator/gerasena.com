import { getHistorico } from "@/lib/historico";

export default async function Historico() {
  const draws = await getHistorico(50);
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h2 className="mb-4 text-xl font-semibold">Histórico</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left">Concurso</th>
            <th className="px-2 py-1 text-left">Data</th>
            <th className="px-2 py-1 text-left">Dezenas</th>
          </tr>
        </thead>
        <tbody>
          {draws.map((d) => (
            <tr key={d.concurso} className="odd:bg-gray-100">
              <td className="px-2 py-1">{d.concurso}</td>
              <td className="px-2 py-1">{d.data}</td>
              <td className="px-2 py-1">
                {[d.bola1, d.bola2, d.bola3, d.bola4, d.bola5, d.bola6].join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
