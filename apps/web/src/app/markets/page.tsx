import TradeForm from '@/components/TradeForm'

export default function MarketDetail({ params }: { params: { id: string } }) {
  return (
    <main className="p-8">
      <h1>Market {params.id}</h1>
      <TradeForm />
    </main>
  )
}