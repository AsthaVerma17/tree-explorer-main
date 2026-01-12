import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, Pencil, Folder, FolderOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TreeNode as TreeNodeType } from '@/hooks/useTreeStorage';

interface TreeNodeProps {
  node: TreeNodeType;
  level: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onAdd: (parentId: string, name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onMoveNode: (dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => void;
  draggedId: string | null;
  setDraggedId: (id: string | null) => void;
  expanded: Record<string, boolean>;
}

export const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  level,
  isExpanded,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  onMoveNode,
  draggedId,
  setDraggedId,
  expanded,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState(node.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const hasChildren = node.children && node.children.length > 0;
  const isDragging = draggedId === node.id;
  const canDrop = draggedId && draggedId !== node.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedId(node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canDrop) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    if (y < height * 0.25) {
      setDropPosition('before');
    } else if (y > height * 0.75) {
      setDropPosition('after');
    } else {
      setDropPosition('inside');
    }
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId && dropPosition) {
      onMoveNode(draggedId, node.id, dropPosition);
    }
    setDropPosition(null);
    setDraggedId(null);
  };

  const handleAddSubmit = () => {
    if (newName.trim()) {
      onAdd(node.id, newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  const handleEditSubmit = () => {
    if (editName.trim()) {
      onUpdate(node.id, editName.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onRemove(node.id);
    setConfirmDelete(false);
  };

  return (
    <div className="select-none">
      {/* Drop indicator - before */}
      {dropPosition === 'before' && (
        <div className="h-0.5 bg-primary rounded-full mx-2 -my-px" />
      )}
      
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={() => setDraggedId(null)}
        className={cn(
          'group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-all duration-150',
          'hover:bg-accent',
          isDragging && 'opacity-50',
          dropPosition === 'inside' && 'bg-accent ring-2 ring-primary/20',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/Collapse button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
          className={cn(
            'flex items-center justify-center w-5 h-5 rounded transition-colors',
            hasChildren ? 'hover:bg-muted' : 'invisible'
          )}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          )}
        </button>

        {/* Icon */}
        <span className="flex items-center justify-center w-5 h-5 text-muted-foreground">
          {hasChildren ? (
            isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </span>

        {/* Name */}
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="h-7 text-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleEditSubmit}>
              Save
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <span
            className="flex-1 text-sm font-medium text-foreground truncate"
            onDoubleClick={() => {
              setEditName(node.name);
              setIsEditing(true);
            }}
          >
            {node.name}
          </span>
        )}

        {/* Actions */}
        {!isEditing && !confirmDelete && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setEditName(node.name);
                setIsEditing(true);
              }}
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsAdding(true);
                setNewName('');
              }}
              title="Add child"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="flex items-center gap-1 text-sm" onClick={(e) => e.stopPropagation()}>
            <span className="text-muted-foreground">Delete?</span>
            <Button size="sm" variant="destructive" className="h-6 px-2" onClick={handleDelete}>
              Yes
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => setConfirmDelete(false)}>
              No
            </Button>
          </div>
        )}
      </div>

      {/* Drop indicator - after */}
      {dropPosition === 'after' && (
        <div className="h-0.5 bg-primary rounded-full mx-2 -my-px" />
      )}

      {/* Add new node form */}
      {isAdding && (
        <div
          className="flex items-center gap-1 py-1.5 px-2"
          style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
        >
          <span className="w-5" />
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubmit();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            placeholder="Node name"
            className="h-7 text-sm flex-1"
            autoFocus
          />
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleAddSubmit}>
            Add
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-border"
            style={{ left: `${level * 16 + 20}px` }}
          />
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={expanded[child.id] ?? false}
              onToggle={onToggle}
              onAdd={onAdd}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onMoveNode={onMoveNode}
              draggedId={draggedId}
              setDraggedId={setDraggedId}
              expanded={expanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};
