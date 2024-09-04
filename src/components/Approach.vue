<template>
  <section class="py-16 sm:py-24 bg-gradient-to-br from-primary-pink to-primary-blue bg-opacity-10">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl sm:text-5xl font-bold text-primary-blue mb-12 text-center">
        Minha Abordagem
      </h2>
      <div class="bg-white rounded-xl shadow-2xl p-8 sm:p-12">
        <p class="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed">
          Na minha prática clínica, utilizo a Terapia Relacional Sistêmica como principal ferramenta de trabalho. Esta abordagem nos permite olhar para o indivíduo não de forma isolada, mas como parte de um sistema complexo de relações e contextos que influenciam sua vida.
        </p>
        <p class="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed">
          A Terapia Relacional Sistêmica reconhece que cada pessoa é única, com sua própria história, experiências e formas de se relacionar com o mundo. Partindo desse princípio, meu trabalho se baseia em:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="(principle, index) in principles" :key="index" class="bg-primary-pink bg-opacity-10 rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <h3 class="text-xl font-semibold text-primary-blue mb-4">{{ principle.title }}</h3>
            <p class="text-gray-700">{{ principle.description }}</p>
          </div>
        </div>
        <div class="mt-12 text-lg sm:text-xl text-gray-700 space-y-6">
          <p>
            Através desta abordagem, busco criar um espaço seguro e acolhedor, onde você possa explorar suas questões, reconhecer seus recursos internos e externos, e construir novos significados para suas experiências.
          </p>
          <p>
            Acredito que, ao olharmos para nossas vivências através de uma lente sistêmica e relacional, abrimos portas para transformações profundas e duradouras, que reverberam não apenas em nós, mas em todo o sistema do qual fazemos parte.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MyApproachSection',
  data() {
    return {
      principles: [
        {
          title: 'Escuta Atenta e Empática',
          description: 'Dedico-me a ouvir profundamente cada cliente, buscando compreender não apenas suas palavras, mas também os significados por trás delas.'
        },
        {
          title: 'Respeito às Particularidades',
          description: 'Entendo que cada jornada é única. Não existem fórmulas prontas ou soluções universais.'
        },
        {
          title: 'Visão Holística',
          description: 'Exploramos como diferentes aspectos da sua vida - família, trabalho, relacionamentos, cultura - se interconectam e influenciam seu bem-estar.'
        },
        {
          title: 'Foco nas Relações',
          description: 'Trabalhamos para compreender e, quando necessário, ressignificar os padrões relacionais que você estabelece consigo mesmo e com os outros.'
        },
        {
          title: 'Promoção de Autonomia',
          description: 'Meu objetivo é ajudar você a desenvolver ferramentas e insights que promovam sua autonomia e bem-estar, para além do espaço terapêutico.'
        },
        {
          title: 'Adaptabilidade',
          description: 'Cada sessão é adaptada às suas necessidades específicas daquele momento, permitindo flexibilidade no processo terapêutico.'
        }
      ]
    }
  }
}
</script>