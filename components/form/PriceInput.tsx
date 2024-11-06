import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Prisma } from '@prisma/client';

// const name = Prisma.Pro

type PriceInputProps = {
  defaultValue?: number;
};
const name = 'price';

function PriceInput({ defaultValue }: PriceInputProps) {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Price ($)
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        defaultValue={defaultValue || 100}
        required
      />
    </div>
  );
}

export default PriceInput;
