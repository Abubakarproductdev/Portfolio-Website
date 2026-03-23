"use client";

import React from 'react';
import ScrollStack, { ScrollStackItem } from '../../components/ScrollStack';

const ContactPage = () => {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <ScrollStack 
        useWindowScroll={true}
        itemDistance={1000}       // Matched to screenshot
        itemStackDistance={30}   // Matched to screenshot
        stackPosition="20%"      // Matched to screenshot
        baseScale={0.85}         // Matched to screenshot
        rotationAmount={0}       // Matched to screenshot
        blurAmount={0}           // Matched to screenshot
      >
        <ScrollStackItem itemClassName="bg-neutral-900 border border-neutral-800 text-white flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl font-bold mb-4">Card 1</h2>
          <p className="text-neutral-400">This is the first card in the stack</p>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="bg-neutral-800 border border-neutral-700 text-white flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl font-bold mb-4">Card 2</h2>
          <p className="text-neutral-400">This is the second card in the stack</p>
        </ScrollStackItem>

        <ScrollStackItem itemClassName="bg-neutral-700 border border-neutral-600 text-white flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl font-bold mb-4">Card 3</h2>
          <p className="text-neutral-400">This is the third card in the stack</p>
        </ScrollStackItem>
      </ScrollStack>
    </div>
  );
}

export default ContactPage;