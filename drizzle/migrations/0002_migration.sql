create or replace function public.get_post_counts(p_post_ids uuid[])
returns table(post_id uuid, likes_count bigint, comments_count bigint)
language sql stable security invoker set search_path = public as $$
  select p.id,
    (select count(*) from public.likes l where l.post_id = p.id),
    (select count(*) from public.comments c where c.post_id = p.id)
  from unnest(p_post_ids) as p(id);
$$;
grant execute on function public.get_post_counts(uuid[]) to anon, authenticated;