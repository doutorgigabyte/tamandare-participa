export const metadata = {
  title: 'Sobre',
  description:
    'Quem fez, metodologia, posicionamento não-partidário e política de privacidade (LGPD) da Tamandaré Participa.',
};

export default function SobrePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Sobre a plataforma</h1>
      <p className="mt-4 text-muted-foreground">
        Tamandaré Participa é uma plataforma cívica independente, desenvolvida
        pela Doutor Gigabyte, para apoiar a participação qualificada dos
        cidadãos na revisão do Plano Diretor de Tamandaré/PE — sem substituir
        os canais oficiais da Prefeitura.
      </p>

      <section className="mt-12 border-t border-border pt-8" aria-labelledby="naopartidario">
        <h2 id="naopartidario" className="text-2xl font-semibold tracking-tight">
          Posicionamento
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Esta plataforma não substitui os canais oficiais. As contribuições
          agregadas serão protocoladas junto à Prefeitura para subsidiar — sem
          vincular — o processo legislativo. Não há vinculação partidária, nem
          juízo sobre a gestão municipal.
        </p>
      </section>

      <section
        id="privacidade"
        className="mt-12 scroll-mt-20 border-t border-border pt-8"
        aria-labelledby="privacidade-heading"
      >
        <h2
          id="privacidade-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          Política de Privacidade (LGPD)
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Esta plataforma trata dados pessoais com base no consentimento
          explícito do(a) titular (Lei nº 13.709/2018, art. 7º, I), e apenas
          para a finalidade declarada: subsidiar a revisão do Plano Diretor de
          Tamandaré/PE e a geração de relatório agregado a ser protocolado
          junto à Prefeitura. Não há compartilhamento com terceiros para fins
          comerciais, publicitários ou de marketing.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-foreground">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold">Consentimento explícito.</strong>{' '}
              Nome, e-mail e CPF só são solicitados após você marcar
              expressamente a opção de identificar-se e aceitar esta política
              no envio.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold">CPF hasheado.</strong> O CPF
              nunca é armazenado em texto claro. Guardamos apenas um hash
              criptográfico (SHA-256 com salt) que serve para detectar
              duplicatas, sem permitir recuperar o número original.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold">Anonimato é cidadania de primeira classe.</strong>{' '}
              Contribuições anônimas têm o mesmo peso no relatório consolidado.
              Você não precisa se identificar para ser ouvido(a).
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold">Direito ao esquecimento.</strong>{' '}
              Você pode solicitar a exclusão da sua contribuição a qualquer
              momento. <em className="text-muted-foreground">No MVP atual o
              pedido é feito por e-mail; um botão de auto-serviço será
              disponibilizado na próxima versão.</em>
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              <strong className="font-semibold">Transparência e integridade.</strong>{' '}
              Cada contribuição recebe um hash de integridade (SHA-256) que
              permite verificar, depois, que o texto não foi adulterado. O
              hash é mostrado no comprovante de envio.
            </span>
          </li>
        </ul>

        <p className="mt-6 text-xs text-muted-foreground">
          Dúvidas sobre tratamento de dados? Escreva para{' '}
          <a
            href="mailto:doutorgigabyte.ti@gmail.com"
            className="text-primary underline-offset-2 hover:underline"
          >
            doutorgigabyte.ti@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
