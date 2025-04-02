import { Component } from '@angular/core';
import {NgForOf} from '@angular/common';
import {TherapyAdvantage} from '../../models/therapy-advantage.model';

@Component({
  selector: 'app-advantages',
  imports: [
    NgForOf
  ],
  templateUrl: './advantages.component.html',
  styleUrl: './advantages.component.css'
})
export class AdvantagesComponent {
  advantages: TherapyAdvantage[] = [
    {
      title: "Eficácia Comprovada",
      description: "Estudos mostram que a terapia online é tão eficaz quanto a presencial, proporcionando os mesmos benefícios em termos de autoconhecimento, superação de desafios emocionais e desenvolvimento pessoal.",
      iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Comodidade e Acesso Fácil",
      description: "A terapia online permite que você participe das sessões de onde estiver, economizando tempo e esforço com deslocamentos e tornando o processo terapêutico mais acessível para quem tem uma rotina agitada.",
      iconPath: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    },
    {
      title: "Maior Flexibilidade de Horários",
      description: "Com a possibilidade de agendar sessões em horários que se adaptem melhor à sua agenda, fica mais fácil encaixar a terapia no seu dia a dia, garantindo continuidade no tratamento.",
      iconPath: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Privacidade e Confidencialidade",
      description: "Assim como na terapia presencial, a terapia online segue rígidos padrões de confidencialidade, garantindo um espaço seguro e protegido para suas questões pessoais.",
      iconPath: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    }
  ]
}
