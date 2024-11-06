import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// import { FileUploader } from 'react-drag-drop-files';

// const fileTypes = ["MP4", "MVI", "AVI", "JPG"];

function ImageInput() {
  const name = 'image'; // image5

  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Image
      </Label>
      <Input
        id={name}
        name={name}
        type="file"
        required
        accept="image/*"
        className="max-w-xs"
      />
    </div>
  );
}

export default ImageInput;
