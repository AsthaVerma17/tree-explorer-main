import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TreeNodeComponent } from './TreeNode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTreeStorage } from '@/hooks/useTreeStorage';

export const TreeView: React.FC = () => {
  const {
    tree,
    expanded,
    toggleExpanded,
    addNode,
    updateNode,
    removeNode,
    moveNode,
    addRootNode,
  } = useTreeStorage();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootName, setNewRootName] = useState('');

  const handleAddRoot = () => {
    if (newRootName.trim()) {
      addRootNode(newRootName.trim());
      setNewRootName('');
      setIsAddingRoot(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">Tree View</h2>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => setIsAddingRoot(true)}
          >
            <Plus className="w-4 h-4" />
            Add Root
          </Button>
        </div>

        {/* Tree content */}
        <div className="p-2 min-h-[300px]">
          {/* Add root form */}
          {isAddingRoot && (
            <div className="flex items-center gap-2 p-2 mb-2 bg-muted/50 rounded-md">
              <Input
                value={newRootName}
                onChange={(e) => setNewRootName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddRoot();
                  if (e.key === 'Escape') setIsAddingRoot(false);
                }}
                placeholder="Root node name"
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleAddRoot}>
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingRoot(false)}>
                Cancel
              </Button>
            </div>
          )}

          {/* Tree nodes */}
          {tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">No nodes yet</p>
              <p className="text-xs mt-1">Click "Add Root" to create your first node</p>
            </div>
          ) : (
            tree.map((node) => (
              <TreeNodeComponent
                key={node.id}
                node={node}
                level={0}
                isExpanded={expanded[node.id] ?? false}
                onToggle={toggleExpanded}
                onAdd={addNode}
                onUpdate={updateNode}
                onRemove={removeNode}
                onMoveNode={moveNode}
                draggedId={draggedId}
                setDraggedId={setDraggedId}
                expanded={expanded}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Tip: Double-click to edit • Drag to reorder • Data saved automatically
          </p>
        </div>
      </div>
    </div>
  );
};
