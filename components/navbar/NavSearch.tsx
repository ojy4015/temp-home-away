'use client';
import { Input } from '../ui/input';
// client component
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';

function NavSearch() {
  // next/navigation의 useSerchParams 훅에서 쿼리스트링을 읽을 수 있다.
  const searchParams = useSearchParams();
  // console.log('searchParams >> ', searchParams); //searchParams >>  ReadonlyURLSearchParams { 'category' => 'cabin' }
  // console.log('pathname >> ', pathname); //pathname >>  /

  const { replace } = useRouter();

  // controlled input
  const [search, setSearch] = useState(
    searchParams.get('search')?.toString() || ''
  );

  // console.log('search >> ', search);

  // navigate to back to homepage
  const handleSearch = useDebouncedCallback((value: string) => {
    // get all of the params
    //URLSearchParams는 쿼리스트링의 get/set을 포함 다양한 유틸 메서드를 지원한다.
    const params = new URLSearchParams(searchParams);
    // console.log('params >> ', params);

    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    // console.log('params >>>> ', params.getAll);
    // console.log('pathname >> ', pathname);
    replace(`/?${params.toString()}`);
  }, 500);

  useEffect(() => {
    if (!searchParams.get('search')) {
      setSearch('');
    }
  }, [searchParams.get('search')]);

  return (
    <Input
      type="text"
      placeholder="find a property..."
      className="max-w-xs dark:bg-muted"
      onChange={(e) => {
        setSearch(e.target.value);
        handleSearch(e.target.value);
      }}
      value={search}
    />
  );
}
export default NavSearch;
