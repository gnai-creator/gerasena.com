import { getHistorico } from "@/lib/historico";
import Link from "next/link";
import HistoricoTable from "@/components/HistoricoTable";
import { QTD_HIST } from "@/lib/constants";

export default async function Historico() {
  const draws = await getHistorico(QTD_HIST);
  return (
    <main className="mx-auto max-w-3xl p-4 text-center">
      <h2 className="mb-4 text-xl font-semibold">Histórico</h2>
      <Link
        href="/"
        className="rounded bg-green-600 px-4 py-2 text-white text-center hover:bg-green-700"
      >
        Voltar
      </Link>
      <br />
      <HistoricoTable initialDraws={draws} />
    </main>
  );
}
