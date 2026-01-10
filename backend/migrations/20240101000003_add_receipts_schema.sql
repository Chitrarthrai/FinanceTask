-- Add receipt_url column to transactions
alter table public.transactions add column if not exists receipt_url text;

-- Create receipts storage bucket (if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Policy: Allow users to view their own receipts
create policy "Give users access to own folder 1oj01k_0" on storage.objects for select
using ( bucket_id = 'receipts' and auth.uid() = owner );

-- Policy: Allow users to upload receipts
create policy "Give users access to own folder 1oj01k_1" on storage.objects for insert
with check ( bucket_id = 'receipts' and auth.role() = 'authenticated' );

-- Policy: Allow users to update their own receipts
create policy "Give users access to own folder 1oj01k_2" on storage.objects for update
using ( bucket_id = 'receipts' and auth.uid() = owner );

-- Policy: Allow users to delete their own receipts
create policy "Give users access to own folder 1oj01k_3" on storage.objects for delete
using ( bucket_id = 'receipts' and auth.uid() = owner );
