import React, { useEffect, useState } from 'react';
import { useReactMediaRecorder } from "react-media-recorder";

const AudioRecorder = ({ onStop }) => {
  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({ audio: true });
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Handler to stop recording on mouseup anywhere in the document
    const handleMouseUp = () => {
      if (isRecording) {
        setIsRecording(false);
        stopRecording(); // Stop recording on mouse up
      }
    };

    // Add global mouseup event listener
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isRecording, stopRecording]);

  const handleMouseDown = () => {
    if (!isRecording) {
      setIsRecording(true);
      startRecording(); // Start recording on mouse down
    }
  };

  useEffect(() => {
    if (mediaBlobUrl) {
      onStop(mediaBlobUrl); // Pass the recorded audio blob to the parent component
      clearBlobUrl(); // Clear the blob to prevent re-triggering
    }
  }, [mediaBlobUrl, onStop, clearBlobUrl]);

  return (
    <div style={{ textAlign: 'left', marginTop: '10px' }}> {/* Align the button to the left */}
      <button
        onMouseDown={handleMouseDown} // Start recording on mouse down
        style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', backgroundColor: isRecording ? '#f5ceb8' : '#c8e4fc', color: '#7b8d9c' }} // Styling adjustments
      >
        {isRecording ? 'Recording...' : 'Hold to Record'}
      </button>
    </div>
  );
};

export default AudioRecorder;
