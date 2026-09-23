import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { SITE_URL, WHATSAPP_LINK } from '../../config/contact';

export interface ServicePageSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
}

export interface ServicePageLink {
  readonly label: string;
  readonly route: string;
  readonly fragment?: string;
}

export interface ServicePageContent {
  readonly key: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly intro: string;
  readonly sections: readonly ServicePageSection[];
  readonly ctaTitle: string;
  readonly ctaDescription: string;
  readonly relatedLinks: readonly ServicePageLink[];
}

export const SERVICE_PAGE_CONTENT = {
  therapyOnline: {
    key: 'therapyOnline',
    eyebrow: 'Atendimento online',
    title: 'Terapia Online',
    metaTitle: 'Terapia Online | Natalia Ferreira Psicóloga',
    metaDescription: 'Conheça a terapia online com Natalia Ferreira, Psicóloga Clínica (CRP 12/19892), e veja como iniciar uma conversa sobre seu momento.',
    intro: 'Um espaço de escuta, acolhimento e construção conjunta para olhar para sua experiência com mais clareza, respeitando seu contexto de vida e de relações.',
    sections: [
      {
        heading: 'Um olhar para sua experiência',
        paragraphs: [
          'Na minha prática clínica, utilizo a Terapia Relacional Sistêmica como principal ferramenta de trabalho. Essa abordagem considera a pessoa em relação com sua história, seus vínculos e os contextos que fazem parte da sua vida.',
          'O processo é construído em conjunto, com espaço para nomear questões, reconhecer recursos e pensar em caminhos que façam sentido para você.'
        ]
      },
      {
        heading: 'Para quem busca atendimento online',
        paragraphs: [
          'O atendimento online pode fazer parte da rotina de jovens, adultos e idosos que buscam apoio para questões pessoais, relacionais ou profissionais.',
          'Cada processo é singular. Na conversa inicial, podemos entender sua necessidade, esclarecer dúvidas e avaliar se este formato e esta proposta são adequados para o momento.'
        ],
        bullets: [
          'Autoconhecimento e desenvolvimento pessoal',
          'Relacionamentos e comunicação',
          'Rotinas, equilíbrio e bem-estar',
          'Questões relacionadas à carreira e às transições de vida'
        ]
      },
      {
        heading: 'Como começar',
        paragraphs: [
          'Entre em contato para contar brevemente o que você busca. A partir dessa conversa, combinamos os próximos passos com clareza e cuidado.'
        ]
      }
    ],
    ctaTitle: 'Vamos conversar sobre seu momento?',
    ctaDescription: 'Agende uma conversa inicial e conheça melhor a proposta de atendimento.',
    relatedLinks: [
      { label: 'Conheça minha abordagem', route: '/', fragment: 'abordagem' },
      { label: 'Veja a orientação profissional e de carreira', route: '/orientacao-profissional' }
    ]
  },
  careerGuidance: {
    key: 'careerGuidance',
    eyebrow: 'Carreira e escolhas profissionais',
    title: 'Orientação Profissional e de Carreira',
    metaTitle: 'Orientação Profissional e de Carreira | Natalia Ferreira',
    metaDescription: 'Conheça a orientação profissional e de carreira com Natalia Ferreira e converse sobre transições, escolhas e próximos passos.',
    intro: 'Um espaço para identificar caminhos, organizar perguntas e olhar para decisões profissionais com mais clareza, considerando sua história e seus objetivos.',
    sections: [
      {
        heading: 'Um processo conectado à sua história',
        paragraphs: [
          'Escolhas profissionais não acontecem isoladas da vida. A orientação pode considerar interesses, valores, experiências, relações e o contexto em que cada decisão acontece.',
          'O trabalho conjunto busca transformar dúvidas amplas em perguntas possíveis e próximos passos que respeitem sua realidade.'
        ]
      },
      {
        heading: 'Temas que podem ser conversados',
        paragraphs: [
          'A conversa pode acompanhar diferentes momentos da trajetória profissional, sem reduzir sua experiência a uma única escolha.'
        ],
        bullets: [
          'Transição de carreira e identificação de novos caminhos',
          'Orientação profissional e planejamento de próximos passos',
          'Desafios de confiança, rotina e bem-estar no trabalho',
          'Construção de uma trajetória alinhada com seus valores e objetivos'
        ]
      },
      {
        heading: 'Como começar',
        paragraphs: [
          'Entre em contato para explicar o que está vivendo e o que gostaria de construir. Uma conversa inicial ajuda a esclarecer a demanda e a combinar o formato do processo.'
        ]
      }
    ],
    ctaTitle: 'Quer conversar sobre seus próximos passos?',
    ctaDescription: 'Agende uma conversa para apresentar sua questão e entender como posso ajudar.',
    relatedLinks: [
      { label: 'Conheça a terapia online', route: '/terapia-online' },
      { label: 'Conheça minha abordagem', route: '/', fragment: 'abordagem' }
    ]
  }
} as const satisfies Record<string, ServicePageContent>;

type ServicePageKey = keyof typeof SERVICE_PAGE_CONTENT;

@Component({
  selector: 'app-service-page',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './service-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicePageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly seoService = inject(SeoService);

  readonly whatsappLink = WHATSAPP_LINK;
  readonly page: ServicePageContent = SERVICE_PAGE_CONTENT[
    this.route.snapshot.data['pageKey'] as ServicePageKey
  ];

  ngOnInit(): void {
    const pageUrl = `${SITE_URL}/${this.route.snapshot.url.map(segment => segment.path).join('/')}`;
    this.seoService.updateMetaTags({
      title: this.page.metaTitle,
      description: this.page.metaDescription,
      keywords: `${this.page.title.toLowerCase()}, psicóloga, Natalia Ferreira`,
      url: pageUrl
    });
    this.seoService.setStructuredData(`service-page-${this.page.key}`, [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: this.page.title,
        description: this.page.metaDescription,
        url: pageUrl,
        inLanguage: 'pt-BR'
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: this.page.title, item: pageUrl }
        ]
      }
    ]);
  }

  ngOnDestroy(): void {
    this.seoService.removeStructuredData(`service-page-${this.page.key}`);
  }
}
