# Daily Diet API

Este é o repositório da aplicação **Daily Meals**, que permite aos usuários registrar suas refeições diárias, monitorar sua dieta e obter métricas relacionadas a suas escolhas alimentares. A aplicação é construída para fornecer uma experiência fácil e conveniente para o gerenciamento de refeições pessoais.

## Funcionalidades

A aplicação possui as seguintes funcionalidades:

1. **Cadastro de Usuário:** Os usuários podem criar uma conta na aplicação para acessar todas as funcionalidades disponíveis.
2. **Identificação do Usuário:** A aplicação permite identificar o usuário em cada requisição, garantindo que apenas as refeições relacionadas a ele sejam acessíveis.
3. **Registro de Refeição:** Os usuários podem registrar suas refeições diárias fornecendo as seguintes informações:
   - Nome da refeição.
   - Descrição da refeição.
   - Data e hora da refeição.
   - Indicação se a refeição está dentro ou fora da dieta.
4. **Edição de Refeição:** Os usuários têm a opção de editar qualquer informação de uma refeição previamente registrada.
5. **Exclusão de Refeição:** Os usuários podem apagar uma refeição registrada anteriormente.
6. **Listagem de Refeições:** Os usuários podem visualizar todas as refeições registradas por eles.
7. **Visualização de Refeição:** Os usuários podem ver os detalhes de uma refeição específica.
8. **Métricas do Usuário:** Os usuários podem obter as seguintes métricas relacionadas às suas refeições registradas:
   - Quantidade total de refeições registradas.
   - Quantidade total de refeições dentro da dieta.
   - Quantidade total de refeições fora da dieta.
   - Melhor sequência de refeições dentro da dieta.
9. **Restrição de Acesso:** Os usuários só podem visualizar, editar e apagar as refeições que eles mesmos criaram.

## Tecnologias Utilizadas

A aplicação foi desenvolvida utilizando as seguintes tecnologias:

- Linguagem de programação: NodeJS com typescript
- Framework: Fastify
- Banco de Dados: SQLite