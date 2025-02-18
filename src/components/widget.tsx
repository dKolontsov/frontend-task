import { useState } from 'react';
import { useViewer, useBehaviorSubject } from '../hooks';
import * as THREE from 'three';

const widget = () => {
  const viewer = useViewer();
  const status = useBehaviorSubject(viewer.status);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);

  const handleObjectClick = (object: THREE.Object3D) => {
    viewer.highlightObject(object);
    setSelectedObject(object);
  };

  const renderTree = (obj: THREE.Object3D, level = 0) => {
    return (
      <div key={obj.uuid} style={{ marginLeft: `${level * 15}px` }}>
        <div
          className="tree-node"
          onClick={() => handleObjectClick(obj)}
          style={{
            cursor: 'pointer',
            backgroundColor: selectedObject === obj ? 'rgba(255,0,0,0.1)' : 'transparent',
            padding: '4px 8px',
            borderRadius: '4px',
          }}>
          {obj.userData.name || `Object_${obj.name}`}
        </div>
        {obj.children.map((child) => {
          if (child.type !== 'Object3D') return renderTree(child, level + 1);
        })}
      </div>
    );
  };

  return (
    <div className="widget-container">
      {status === 'loading' && <div className="widget-placeholder">Model not loaded</div>}

      {status === 'idle' && viewer?.model && (
        <>
          <div className="widget-header">Иерархия объектов</div>
          <div className="tree-view">{renderTree(viewer.model)}</div>
        </>
      )}
    </div>
  );
};

export default widget;
