"use client";

import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const certificateTemplates = [
  "/certificates/template1.jpg",
];

export default function CertificateGenerator({ courseTitle }: { courseTitle: string }) {
  const [userName, setUserName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Randomly select a certificate template
    const randomTemplate =
      certificateTemplates[Math.floor(Math.random() * certificateTemplates.length)];
    setSelectedTemplate(randomTemplate);
  }, []);

  const handleGenerateCertificate = async () => {
    if (!userName.trim()) {
      alert("Please enter your name to generate the certificate.");
      return;
    }

    const input = certificateRef.current;
    if (!input) return;

    // Temporarily show the certificate
    input.style.display = "block";

    await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure rendering

    try {
      const canvas = await html2canvas(input, { useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      pdf.addImage(imgData, "PNG", 15, 15, 260, 180);
      pdf.save(`${userName}_Certificate.pdf`);
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      input.style.display = "none";
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold">Generate Your Certificate 🎓</h2>
      <p className="text-gray-600 mb-4">Enter your name to receive the certificate</p>

      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="border p-2 w-80 rounded-md mb-4 text-center"
      />

      <button
        onClick={handleGenerateCertificate}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
      >
        Generate Certificate
      </button>

      {/* Certificate Preview */}
      <div
        ref={certificateRef}
        className="hidden relative w-[800px] h-[600px] mt-6 text-center"
      >
        {selectedTemplate && (
          <img
            src={selectedTemplate}
            alt="Certificate Template"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-black">
          <h2 className="text-4xl font-bold">Certificate of Completion</h2>
          <p className="text-lg mt-2">This is to certify that</p>
          <h1 className="text-3xl font-bold text-blue-700">{userName}</h1>
          <p className="text-lg mt-2">has successfully completed the course</p>
          <h2 className="text-2xl font-semibold">{courseTitle}</h2>
        </div>
      </div>
    </div>
  );
}
