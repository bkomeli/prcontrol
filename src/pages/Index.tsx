import { NewActivationForm } from "@/components/NewActivationForm";
import { ActivationQueue } from "@/components/ActivationQueue";

const Index = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-[calc(100vh-3.5rem)]">
      <div className="overflow-auto">
        <NewActivationForm />
      </div>
      <div className="overflow-hidden flex flex-col">
        <ActivationQueue />
      </div>
    </div>
  );
};

export default Index;
