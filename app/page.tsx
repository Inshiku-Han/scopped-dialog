"use client";

import { ComponentProps, ReactNode, useRef } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeading,
  DialogTrigger,
} from "@/app/components/dialog";

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <main className='h-[400vh] pt-[50px]'>
      <div className='bg-red-800 h-[30vh] relative'>
        <Modal root={ref}>
          <Modal root={ref}>
            <Modal root={ref}>{"Wow It's nested!"}</Modal>
          </Modal>
        </Modal>
      </div>
    </main>
  );
}

function Modal({
  children,
  root,
}: {
  children?: ReactNode;
  root?: ComponentProps<typeof DialogContent>["root"];
}) {
  return (
    <Dialog>
      <DialogTrigger>Button</DialogTrigger>
      <DialogContent
        root={root}
        backdropClassName={`bg-black bg-opacity-50 w-full h-full top-0 left-0 ${
          root ? "absolute" : "fixed"
        }`}
        className={`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white ${
          root ? "absolute" : "fixed"
        }`}
      >
        <DialogHeading>My dialog heading</DialogHeading>
        <DialogDescription>My dialog description</DialogDescription>
        {children}
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
