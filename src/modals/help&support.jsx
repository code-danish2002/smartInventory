import React, { useState } from "react";
import { FaClipboardList, FaStore, FaTruck, FaWpforms, FaCheck } from "react-icons/fa";
import { Pdf01 } from "../utils/icons";

//import images from public folder
import addInspection from "../assets/help-img-1.png";
import createInspection from "../assets/help-img-2.png";
import addItemsDashboard from "../assets/help-img-3.png";
import addItemTable from "../assets/help-img-4.png";
import addItemForm from "../assets/help-img-5.png";
import inspectionCard from "../assets/help-img-6.png";
import inspectionTable from "../assets/help-img-7.png";
import inspectionApproveDialog from "../assets/help-img-8.png";
import pdfDownload from "../assets/help-img-10.png";
import inspectionUpload from "../assets/help-img-11.png";
import lineItemDispatchDialog from "../assets/help-img-12.png";
import lineItemTable from "../assets/help-img-13.png";
import lineItemForm from "../assets/help-img-14.png";
//import itemCard from "../assets/help-img-15.png";
//import itemTable from "../assets/help-img-16.png";
//import itemApproveDialog from "../assets/help-img-17.png";
//import itemUpload from "../assets/help-img-18.png";

export default function HelpAndSupport({ status = [] }) {
  const steps = [
    {
      id: 1,
      name: "Create Inspection",
      bgColor: "bg-blue-500",
      icon: <FaWpforms className="w-5 h-5" />,
      description: "Initiate the inspection process by creating a new inspection record with basic PO details and requirements."
    },
    {
      id: 2,
      name: "Add Item",
      bgColor: "bg-cyan-500",
      icon: <FaClipboardList className="w-5 h-5" />,
      description: "Add items to be inspected with detailed specifications, quantities, items and relevant documentation."
    },
    {
      id: 3,
      name: "Upload PDF",
      bgColor: "bg-yellow-500",
      icon: <Pdf01 className="w-5 h-5" />,
      description: "Upload a PDF file of the item entity to be inspected."
    },
    {
      id: 4,
      name: "Approve PO",
      bgColor: "bg-amber-500",
      icon: <FaWpforms className="w-5 h-5" />,
      description: "Conduct thorough inspection of Line items and items to verify compliance with quality standards and project specifications."
    },
    {
      id: 5,
      name: "Store",
      bgColor: "bg-purple-500",
      icon: <FaStore className="w-5 h-5" />,
      description: "Items are sent to central storage facility for inventory management and future allocation to project sites."
    },
    {
      id: 6,
      name: "Site",
      bgColor: "bg-teal-500",
      icon: <FaTruck className="w-5 h-5" />,
      description: "Items are dispatched to project sites either directly from inspection or via storage for implementation."
    },
    {
      id: 7,
      name: "Live/OEM Spare",
      bgColor: "bg-green-500",
      icon: <FaCheck className="w-5 h-5" />,
      description: "Final status where items are either actively in use at project sites (Live) or maintained in inventory."
    }
  ];

  const [openAccordion, setOpenAccordion] = useState(null);

  const Accordion = ({ title, content, id }) => {
    const isOpen = openAccordion === id;

    return (
      <div className="border-b border-gray-200">
        <button
          className="w-full flex justify-between items-center py-4 px-6 text-left text-lg font-semibold text-gray-800 focus:outline-none"
          onClick={() => setOpenAccordion(isOpen ? null : id)}
        >
          <span>{title}</span>
          <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-[85vh] overflow-y-auto bg-gray-50 rounded-xl shadow-md p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Getting Started</h1>
          <p className="text-gray-600 mt-2">A quick guide to understanding the inspection process flow.</p>
        </div>

        {/* Process Flow */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Process Flow</h2>
          {/* Desktop View */}
          <div className="hidden md:block mb-8">
            <div className="flex justify-between relative">
              {/* Main timeline */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 z-0"></div>

              {/* Steps */}
              {steps.map((step, index) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-2 ${step.bgColor} text-white transition-all duration-300`}>
                      {step.icon}
                    </div>
                    <span className="text-sm font-medium text-center px-2">{step.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden mb-8">
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${step.bgColor} text-white mr-4 flex-shrink-0`}>
                    {step.icon}
                  </div>
                  <span className="font-medium text-gray-800">{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">i</span>
            Process Legend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div key={step.id} className="border-l-4 border-gray-500 pl-4 py-1">
                <div className="flex items-start">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 flex-shrink-0 mt-1 ${step.bgColor} text-white text-sm`}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{step.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accordion Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <Accordion
            id="how-it-works"
            title="How it Works?"
            content={
              <div>
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">You as a Purchase Authority</h4>
                  <ul className="list-disc list-inside">
                    <li className="mb-2">You have to initiate an inspection (click <b>+Inspection</b> in drawer) of purchase order asked for to start the process and send to the Inspection Authority to fill in the details.(Images: Image-1 & Image-2)</li>
                    <div className="grid grid-cols-2 justify-center gap-2">
                      <figure className="my-4 text-center">
                        <img src={addInspection} alt="add inspection" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-1</figcaption>
                      </figure>
                      <figure className="my-4 text-center">
                        <img src={createInspection} alt="createInspection" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-2</figcaption>
                      </figure>
                    </div>
                    <li className="mb-2">The inspection authority fills the details request received in <b>Item Requests</b> in the dashboard and upload certificate.</li>
                    <div>
                      <figure className="my-4 text-center">
                        <img src={addItemsDashboard} alt="addItemsDashboard" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-3</figcaption>
                      </figure>
                      <figure className="my-4 text-center">
                        <img src={addItemTable} alt="add items request table" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-4</figcaption>
                      </figure>
                      <figure className="my-4 text-center">
                        <img src={addItemForm} alt="add items request form" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-5</figcaption>
                      </figure>
                      <figure className="my-4 text-center">
                        <img src={inspectionCard} alt="add certificate" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-6</figcaption>
                      </figure>
                      <figure className="my-4 text-center">
                        <img src={inspectionTable} alt="add certificate form" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-7</figcaption>
                      </figure>
                      <figure className="my-4 text-center">
                        <img src={inspectionApproveDialog} alt="add certificate table" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-8</figcaption>
                      </figure>
                      <figure className="my-4 text-center">
                        <img src={pdfDownload} alt="add certificate table" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-9</figcaption>
                      </figure>
                      <figure className="my-4 text-center">
                        <img src={inspectionUpload} alt="add certificate table" className="mx-auto rounded-md shadow-md" />
                        <figcaption className="mt-2 text-sm text-gray-600">Image-10</figcaption>
                      </figure>
                    </div>
                    <li className="mb-2">The purchase authority approve the Line Items and will dispatch the items to the respective sites or stores to which the items are bound.</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">You as a Store Incharge</h4>
                  <ul className="list-disc list-inside">
                    <li className="mb-2">You will receive items sent by the inspection incharge or other store in <b>Store section</b>  of dashboard.</li>
                    <figure className="my-4 text-center">
                      <img src={lineItemDispatchDialog} alt="line item dispatch" className="mx-auto rounded-md shadow-md" />
                      <figcaption className="mt-2 text-sm text-gray-600">Image-11</figcaption>
                    </figure>
                    <li className="mb-2">Accept the item/s (Click on <b>Accept Me</b> button).</li>
                    <li className="mb-2">Dispatch the item/s to the sites or other store for which item bound to (Click on <b>Dispatch</b> button).</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">You as a Site Incharge</h4>
                  <ul className="list-disc list-inside">
                    <li className="mb-2">You will receive items sent by the Inspection Incharge or Store Incharge in <b>At Site section</b>  of dashboard.</li>
                    <li className="mb-2">Accept the item/s (Click on <b>Accept Me</b> button).</li>
                    <li className="mb-2">Send the item/s to the OEM Spare or send for Live (Click on <b>Send</b> button).</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">You as an OEM Spare Incharge</h4>
                  <ul className="list-disc list-inside">
                    <li className="mb-2">You will receive items sent by the Site Incharge in <b>OEM Spare section</b>  of dashboard.</li>
                    <li className="mb-2">Send the item/s to the Live (Click on <b>Live</b> button).</li>
                  </ul>
                </div>
              </div>
            }
          />
          <Accordion
            id="how-rejects-handled"
            title="How Rejects are Handled?"
            content={
              <div>
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">Rejection while Inspection</h4>
                  <p>Data operator will receive rejected Line Item/s in <b>Re-Fill</b> section of dashboard. Data Operator will review reason of rejection and make changes accordingly.</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">Rejection at Store</h4>
                  <p>Inspection Incharge will receive rejected Item/s in <b>Store Rejects</b> section of dashboard. Inspection Incharge will review the reason of rejection and dispatch item/s again accordingly.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Rejection at Site</h4>
                  <p>Previous owner (Inspection Incharge or Store Incharge) will receive rejected Item/s in <b>Site Rejects</b> section of dashboard. Previous owner will review the reason of rejection and dispatch item/s again accordingly.</p>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};