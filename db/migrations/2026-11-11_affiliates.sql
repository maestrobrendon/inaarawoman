-- Affiliate / creator discount codes.
-- Additive only: new nullable columns + a trigger. Safe to run on the live DB.

-- Who the code belongs to
alter table public.discount_codes add column if not exists affiliate_name text;
alter table public.discount_codes add column if not exists affiliate_contact text;
alter table public.discount_codes add column if not exists notes text;
alter table public.discount_codes alter column start_date set default now();

-- Which code an order used, and how much it took off
alter table public.orders add column if not exists discount_code text;
alter table public.orders add column if not exists discount_amount numeric(10,2) default 0;
create index if not exists orders_discount_code_idx on public.orders (discount_code) where discount_code is not null;

-- Count a use whenever an order is placed with a code
create or replace function public.count_discount_use() returns trigger
language plpgsql as $$
begin
  if new.discount_code is not null then
    update public.discount_codes
       set uses_count = coalesce(uses_count, 0) + 1, updated_at = now()
     where code = upper(new.discount_code);
  end if;
  return new;
end $$;

drop trigger if exists orders_count_discount_use on public.orders;
create trigger orders_count_discount_use
  after insert on public.orders
  for each row execute function public.count_discount_use();
