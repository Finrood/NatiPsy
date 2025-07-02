import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {TherapyPrinciple} from '../../models/therapy-principle.model';

@Component({
  selector: 'app-approach',
  imports: [
    NgOptimizedImage
],
  templateUrl: './approach.component.html',
  styleUrl: './approach.component.css'
})
export class ApproachComponent {
  principles: TherapyPrinciple[] = [
    {
      title: 'Escuta Atenta e Empática',
      description: 'Dedico-me a ouvir profundamente cada cliente, buscando compreender não apenas suas palavras, mas também os significados por trás delas.',
    },
    {
      title: 'Respeito às Particularidades',
      description: 'Entendo que cada jornada é única. Não existem fórmulas prontas ou soluções universais.',
    },
    {
      title: 'Visão Holística',
      description: 'Exploramos como diferentes aspectos da sua vida - família, trabalho, relacionamentos, cultura - se interconectam e influenciam seu bem-estar.',
    },
    {
      title: 'Foco nas Relações',
      description: 'Trabalhamos para compreender e, quando necessário, ressignificar os padrões relacionais que você estabelece consigo mesmo e com os outros.',
    },
    {
      title: 'Promoção de Autonomia',
      description: 'Meu objetivo é ajudar você a desenvolver ferramentas e insights que promovam sua autonomia e bem-estar, para além do espaço terapêutico.',
    },
    {
      title: 'Adaptabilidade',
      description: 'Cada sessão é adaptada às suas necessidades específicas daquele momento, permitindo flexibilidade no processo terapêutico.',
    }
  ]

  trackByFn(index: number, principle: any) {
    return principle.title;
  }
}
