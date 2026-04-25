import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as parentsApi from '../api/parents.api';
import { CreateParentInput, UpdateParentInput, LinkStudentInput } from '../types/parents.types';
import { useToast } from '@/hooks/useToast';

export const useParents = (search?: string) => {
  return useQuery({
    queryKey: ['parents', search],
    queryFn: () => parentsApi.fetchAllParents(search),
  });
};

export const useInfiniteParents = (search?: string) => {
  return useInfiniteQuery({
    queryKey: ['parents', 'infinite', search],
    queryFn: ({ pageParam }) => parentsApi.fetchParentsPage(search, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < last.totalPages ? last.page + 1 : undefined,
  });
};

export const useParentById = (id: string | null) => {
  return useQuery({
    queryKey: ['parents', id],
    queryFn: () => id ? parentsApi.fetchParentById(id) : Promise.reject('No ID'),
    enabled: !!id,
  });
};

export const useCreateParent = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data: CreateParentInput) => parentsApi.createParent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      success('Parent account created');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to create parent';
      error(msg);
    }
  });
};

export const useUpdateParent = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParentInput }) =>
      parentsApi.updateParent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['parents', variables.id] });
      success('Parent updated');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update parent';
      error(msg);
    }
  });
};

export const useLinkStudent = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ parentId, data }: { parentId: string; data: LinkStudentInput }) =>
      parentsApi.linkStudent(parentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['parents', variables.parentId] });
      success('Student linked successfully');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to link student';
      error(msg);
    }
  });
};

export const useMyChildren = () => {
  return useQuery({
    queryKey: ['my-children'],
    queryFn: () => parentsApi.fetchMyChildren(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useUnlinkStudent = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ parentId, studentId }: { parentId: string; studentId: string }) =>
      parentsApi.unlinkStudent(parentId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['parents', variables.parentId] });
      success('Student unlinked');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to unlink student';
      error(msg);
    }
  });
};
