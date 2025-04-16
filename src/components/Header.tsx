
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

interface HeaderProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const Header = ({ language, setLanguage }: HeaderProps) => {
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-medical-600 text-white flex items-center justify-center font-bold text-xl">
            CB
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">BloodVista</h1>
            <p className="text-sm text-gray-500">CBC Report Analyzer</p>
          </div>
        </div>
        
        <ToggleGroup 
          type="single" 
          value={language}
          onValueChange={(value) => {
            if (value) setLanguage(value);
          }}
          className="border border-gray-200 rounded-md"
        >
          <ToggleGroupItem value="en" aria-label="English">
            EN
          </ToggleGroupItem>
          <ToggleGroupItem value="ur" aria-label="Urdu">
            UR
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>
  );
};

export default Header;
