import { PageHeader } from '../layouts/PageHeader'
import { Card, ModuleNotInitialized } from '../components'

export default function Copilot() {
  return (
    <>
      <PageHeader title="AI Copilot" description="Conversational assistant over plant intelligence. The LLM provider is configured server-side only (AI_PROVIDER / AI_API_KEY); nothing is wired in Phase 2." />
      <Card>
        <ModuleNotInitialized module="AI Copilot" phase="the final phase" description="It will answer questions grounded in incidents, baselines and simulations — never on fabricated data." />
      </Card>
    </>
  )
}
