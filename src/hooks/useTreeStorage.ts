import { useState, useEffect, useCallback } from 'react';

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

const STORAGE_KEY = 'tree-view-data';
const EXPANDED_KEY = 'tree-view-expanded';

const defaultTree: TreeNode[] = [
  {
    id: '1',
    name: 'Documents',
    children: [
      { id: '1-1', name: 'Work', children: [{ id: '1-1-1', name: 'Projects' }] },
      { id: '1-2', name: 'Personal' },
    ],
  },
  {
    id: '2',
    name: 'Pictures',
    children: [
      { id: '2-1', name: 'Vacation' },
      { id: '2-2', name: 'Family' },
    ],
  },
];

export function useTreeStorage() {
  const [tree, setTree] = useState<TreeNode[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultTree;
    } catch {
      return defaultTree;
    }
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(EXPANDED_KEY);
      return stored ? JSON.parse(stored) : { '1': true, '2': true };
    } catch {
      return { '1': true, '2': true };
    }
  });

  // Persist tree to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
  }, [tree]);

  // Persist expanded state to localStorage
  useEffect(() => {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(expanded));
  }, [expanded]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const addNode = useCallback((parentId: string, name: string) => {
    const addToTree = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) =>
        node.id === parentId
          ? {
              ...node,
              children: [
                ...(node.children || []),
                { id: `${parentId}-${Date.now()}`, name },
              ],
            }
          : {
              ...node,
              children: node.children ? addToTree(node.children) : undefined,
            }
      );
    setTree((prev) => addToTree(prev));
    setExpanded((prev) => ({ ...prev, [parentId]: true }));
  }, []);

  const updateNode = useCallback((id: string, name: string) => {
    const updateInTree = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, name }
          : { ...node, children: node.children ? updateInTree(node.children) : undefined }
      );
    setTree((prev) => updateInTree(prev));
  }, []);

  const removeNode = useCallback((id: string) => {
    const removeFromTree = (nodes: TreeNode[]): TreeNode[] =>
      nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          children: node.children ? removeFromTree(node.children) : undefined,
        }));
    setTree((prev) => removeFromTree(prev));
  }, []);

  const moveNode = useCallback((dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => {
    let draggedNode: TreeNode | null = null;

    const removeNodeById = (nodes: TreeNode[]): TreeNode[] =>
      nodes
        .filter((node) => {
          if (node.id === dragId) {
            draggedNode = { ...node };
            return false;
          }
          return true;
        })
        .map((node) => ({
          ...node,
          children: node.children ? removeNodeById(node.children) : undefined,
        }));

    const insertNode = (nodes: TreeNode[]): TreeNode[] => {
      const result: TreeNode[] = [];
      for (const node of nodes) {
        if (node.id === dropId && draggedNode) {
          if (position === 'before') {
            result.push(draggedNode);
            result.push({ ...node, children: node.children ? insertNode(node.children) : undefined });
          } else if (position === 'after') {
            result.push({ ...node, children: node.children ? insertNode(node.children) : undefined });
            result.push(draggedNode);
          } else if (position === 'inside') {
            result.push({
              ...node,
              children: [...(node.children || []), draggedNode],
            });
            setExpanded((prev) => ({ ...prev, [dropId]: true }));
          }
        } else {
          result.push({
            ...node,
            children: node.children ? insertNode(node.children) : undefined,
          });
        }
      }
      return result;
    };

    setTree((prev) => {
      const removed = removeNodeById(prev);
      if (!draggedNode) return prev;
      return insertNode(removed);
    });
  }, []);

  const addRootNode = useCallback((name: string) => {
    setTree((prev) => [...prev, { id: `root-${Date.now()}`, name }]);
  }, []);

  return {
    tree,
    expanded,
    toggleExpanded,
    addNode,
    updateNode,
    removeNode,
    moveNode,
    addRootNode,
  };
}
