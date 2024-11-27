import React from "react";

import RecordButton from "@/components/RecordButton";

type Props = {
  children: React.ReactNode;
};

const DashboardLayout = (props: Props) => {
  return (
    <div className="flex justify-center min-h-screen">
      <div className="bg-black h-screen w-1/6 justify-self-start">hi</div>
      <div className="w-5/6 min-h-screen border border-red-500">
        <div className=" h-screen w-full">
          <RecordButton />
        </div>
        {props.children}
      </div>
    </div>
  );
};

export default DashboardLayout;
