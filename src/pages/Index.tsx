import { TreeView } from '@/components/tree/TreeView';

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tree View Demo</h1>
          <p className="text-muted-foreground">
            A modern, minimal tree component with drag & drop, editing, and auto-save
          </p>
        </div>
        <TreeView />
      </div>
    </div>
  );
};

export default Index;
