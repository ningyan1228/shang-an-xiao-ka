-- 支持五个选项（A-E）和多选题。已有单选题保持不变。
alter table public.knowledge_cards
  add column if not exists option_e text,
  add column if not exists correct_options text[] not null default '{}';

alter table public.knowledge_cards
  drop constraint if exists knowledge_cards_question_type_check;
alter table public.knowledge_cards
  add constraint knowledge_cards_question_type_check
  check (question_type in ('choice', 'multiple', 'recall'));

alter table public.knowledge_cards
  drop constraint if exists knowledge_cards_correct_option_check;
alter table public.knowledge_cards
  add constraint knowledge_cards_correct_option_check
  check (correct_option in ('A', 'B', 'C', 'D', 'E') or correct_option is null);

update public.knowledge_cards
set correct_options = array[correct_option]
where correct_option is not null
  and cardinality(correct_options) = 0;

alter table public.knowledge_cards
  drop constraint if exists knowledge_cards_correct_options_check;
alter table public.knowledge_cards
  add constraint knowledge_cards_correct_options_check
  check (correct_options <@ array['A', 'B', 'C', 'D', 'E']);
