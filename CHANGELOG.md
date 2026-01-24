# Changelog - Projeto Inga Capoeira

## Histórico de Alterações

### [Unreleased] feat: Vídeos de aulas por categoria
**Data:** Janeiro 2026

#### Sistema de Vídeos de Aulas
- **Três categorias:** Movimentações, Musicalidade, História/Curiosidades
- **Tabs interativos:** Navegação entre categorias com contador de vídeos
- **Thumbnails automáticas:** Extração automática do YouTube
- **Botão adicionar (Admin):** Apenas administradores podem adicionar vídeos
- **Modal de cadastro:** Formulário completo com título, URL, categoria, descrição, instrutor, duração e nível

#### Banco de Dados
- **Tabela `video_aulas`:** Armazena vídeos com categoria, URL, thumbnail, duração, nível e instrutor

#### API Criada
- `GET /api/videos` - Lista vídeos (agrupados por categoria)
- `POST /api/videos` - Adicionar vídeo (admin)
- `PUT /api/videos` - Atualizar vídeo (admin)
- `DELETE /api/videos` - Remover vídeo (admin)

#### Arquivos Criados
- `src/app/api/videos/route.ts` - API de vídeos

#### Arquivos Modificados
- `src/components/MembersArea.tsx` - Nova seção de vídeos por categoria
- `src/lib/migrations/create-users-table.sql` - Tabela video_aulas
- `src/types/members.ts` - Tipos VideoAula e VideosPorCategoria

---

### [20b83af] feat: Sistema de presenças, calendário e painel do instrutor
**Data:** Janeiro 2026

- Sistema de check-in via QR Code com expiração
- Painel do instrutor com estatísticas e gestão de aulas
- Calendário interativo com eventos e aulas
- Acesso admin ao painel instrutor com seletor
- Componentes padronizados: EventCard e AcademyCard
- Novas estatísticas no dashboard admin
- APIs de relatórios (presenças, inscrições, crescimento)

---

### [8ef25cd] fix: Atualiza liderança na página Nossa História
**Data:** Janeiro 2026

- Correção de informações da liderança
