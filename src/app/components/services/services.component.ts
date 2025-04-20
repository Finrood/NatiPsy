import {Component, OnInit} from '@angular/core';
import {NgForOf, NgOptimizedImage} from '@angular/common';

interface Service {
  title: string;
  description: string;
  iconPath: string;
}

@Component({
  selector: 'app-services',
  imports: [
    NgForOf,
    NgOptimizedImage
  ],
  standalone: true,
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  phoneNumber: string = '+554884323764';
  message: string = '';

  services: Service[] = [
    {
      title: 'Desenvolvimento de Rotinas de Qualidade',
      description: 'Você experiencia a vida através de uma desordem em atenção ou humor? Imagine como rotinas mais estruturadas podem favorecer o equilíbrio e a sua qualidade de vida.',
      iconPath: '/assets/icons/desenvolvimento-rotinas.svg'
    },
    {
      title: 'Autoconhecimento e Vida Independente',
      description: 'Fortaleça a autoconsciência e desenvolva habilidades para uma vida mais autônoma e feliz, alinhada com seus valores e objetivos pessoais.',
      iconPath: '/assets/icons/autoconhecimento.svg'
    },
    {
      title: 'Relacionamentos Saudáveis',
      description: 'Construa relacionamentos mais saudáveis com amigos, familiares e parceiros, através da melhoria da comunicação e compreensão das dinâmicas emocionais.',
      iconPath: '/assets/icons/relacionamentos.svg'
    },
    {
      title: 'Desenvolvimento de Autoconfiança e Autoestima',
      description: 'Reconheça suas forças e potencialidades, fortalecendo a confiança em si mesmo e cultivando uma autoestima positiva.',
      iconPath: '/assets/icons/autoconfianca.svg'
    },
    {
      title: 'Gerenciamento de Medos, Ansiedades e Estresse',
      description: 'Desenvolva estratégias para lidar de forma mais eficiente com o estresse, medos e ansiedade, promovendo maior tranquilidade no dia a dia.',
      iconPath: '/assets/icons/gerenciamento-emocoes.svg'
    },
    {
      title: 'Transição de Carreira e Orientação Profissional',
      description: 'Posso te ajudar a identificar novos caminhos e superar desafios com mais clareza e confiança.',
      iconPath: '/assets/icons/transicao-carreira.svg'
    }
  ];

  constructor() {
  }

  get whatsappLink(): string {
    return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.message)}`;
  }
}
