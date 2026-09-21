-- Applied through Supabase MCP: trade_crud_ownership_and_feedback.
-- Follow-up SQL for the existing journal schema (apply once).
alter policy "Users can update own trades" on public.trades to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "Users can view own trades" on public.trades to authenticated using ((select auth.uid()) = user_id);
alter policy "Users can insert own trades" on public.trades to authenticated with check ((select auth.uid()) = user_id);
alter policy "Users can delete own trades" on public.trades to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.trades to authenticated;
grant select, insert, delete on public.ai_feedback to authenticated;
create policy "Users can delete own AI feedback" on public.ai_feedback for delete to authenticated using (trade_id in (select id from public.trades where user_id = (select auth.uid())));
create or replace function public.clear_feedback_on_trade_edit() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if old is distinct from new then
    delete from public.ai_feedback where trade_id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function public.clear_feedback_on_trade_edit() from public, anon, authenticated;
create trigger clear_feedback_on_trade_edit after update on public.trades for each row execute function public.clear_feedback_on_trade_edit();
create index if not exists trades_user_date_idx on public.trades(user_id, trade_date desc);
create index if not exists ai_feedback_trade_id_idx on public.ai_feedback(trade_id);
alter policy "Users can upload their own screenshots" on storage.objects to authenticated with check (bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = (select auth.uid())::text);
alter policy "Users can update their own screenshots" on storage.objects to authenticated using (bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'trade-screenshots' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Applied follow-up: journal_auth_function_permissions.
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke all on public.trades, public.ai_feedback, public.profiles from anon;
