import { RequireAuth } from '@/components/auth/RequireAuth';
import { Editor } from '@/components/editor/Editor';

export default async function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequireAuth>
      <Editor canvasId={id} />
    </RequireAuth>
  );
}
