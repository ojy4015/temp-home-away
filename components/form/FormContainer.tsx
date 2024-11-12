'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { actionFunction } from '@/utils/types';

const initialState = {
  message: '',
};

function FormContainer({
  action,
  children,
}: {
  action: actionFunction;
  children: React.ReactNode;
}) {
  //useFormState: form 액션(toggleFavoriteAction)의 결과에 기반하여 상태(message)를 업데이트할 수 있게 해주는 Hook
  //useFormState에 form의 액션 함수와 초기값을 전달하면, form에 사용할 새로운 액션과 최신 state를 반환
  //최신 state는 제공한 함수에도 전달
  // action : form이 제출될 때 호출할 함수
  // formAction 이 toggleFavoriteAction
  const [state, formAction] = useFormState(action, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({ description: state.message });
    }
  }, [state]);

  // {children}이 <CardSubmitButton isFavorite={favoriteId ? true : false} />
  return <form action={formAction}>{children}</form>;
}

export default FormContainer;
