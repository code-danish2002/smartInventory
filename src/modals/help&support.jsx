import React from "react";
import { FaClipboardList, FaStore, FaTruck, FaWpforms, FaCheck } from "react-icons/fa";
import { Pdf01 } from "../utils/icons";

//import images from public folder
import addInspection from "../assets/help-img-1.png";
import createInspection from "../assets/help-img-2.png";
import addItemsDashboard from "../assets/help-img-3.png";
import addItemTable from "../assets/help-img-4.png";
import addItemForm from "../assets/help-img-5.png";

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
      name: "Inspection",
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
      name: "Live/Inventory",
      bgColor: "bg-green-500",
      icon: <FaCheck className="w-5 h-5" />,
      description: "Final status where items are either actively in use at project sites (Live) or maintained in inventory."
    }
  ];

  return (
    <div className="w-full h-[85vh] overflow-y-auto bg-gray-50 rounded-xl shadow-md p-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Process Flow</h2>

        {/* Desktop View */}
        <div className="hidden md:block mb-8">
          <div className="flex justify-between relative">
            {/* Main timeline */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 z-0"></div>

            {/* First row */}
            {steps.slice(0, 4).map((step, index) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-16 h-16 rounded-full mb-2
                    ${step.bgColor}
                    text-white transition-all duration-300
                  `}>
                    {step.icon}
                  </div>

                  <span className="text-sm font-medium text-center px-2">
                    {step.name}
                  </span>
                </div>
              </div>
            ))}

            {/* Second row - Store*/}
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-16 h-16 rounded-full mb-2
                  ${steps.find(step => step.id === 5)?.bgColor}
                  text-white transition-all duration-300
                `}>
                  {steps.find(step => step.id === 5)?.icon}
                </div>

                <span className="text-sm font-medium text-center px-2">
                  {steps.find(step => step.id === 5)?.name}
                </span>
              </div>
            </div>

            {/* Third row - Site and Live/Inventory */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-16 h-16 rounded-full mb-2
                  ${steps.find(step => step.id === 6)?.bgColor}
                  text-white transition-all duration-300
                `}>
                  {steps?.find(step => step.id === 6)?.icon}
                </div>

                <span className="text-sm font-medium text-center px-2">
                  {steps?.find(step => step.id === 6)?.name}
                </span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-16 h-16 rounded-full mb-2
                  ${steps?.find(step => step.id === 7)?.bgColor}
                  text-white transition-all duration-300
                `}>
                  {steps?.find(step => step.id === 7)?.icon}
                </div>

                <span className="text-sm font-medium text-center px-2">
                  {steps?.find(step => step.id === 7)?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Corrected connection lines for Inspection to Site */}
          <div className="relative h-20 mt-4">
            {/* Vertical line from Inspection */}
            <div className="absolute top-0 left-[52.5%] w-0.5 h-8 bg-gray-300"></div>

            {/* Horizontal line to Site */}
            <div className="absolute top-8 left-[52.5%] w-[26.65%] h-0.5 bg-gray-300"></div>

            {/* Vertical line to Site */}
            <div className="absolute top-0 left-[79%] w-0.5 h-8 bg-gray-300"></div>

            {/* Label */}
            <div className="absolute top-10 left-[67%] transform -translate-x-1/2 text-xs text-gray-500">Direct to Site</div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden mb-8">
          <div className="space-y-4">
            {steps.slice(0, 4).map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${step.bgColor} text-white mr-4 flex-shrink-0}`}>
                  {step.icon}
                </div>
                <span className="font-medium text-gray-800">{step.name}</span>
              </div>
            ))}

            {/* Branching */}
            <div className="ml-6 pl-6 border-l-2 border-gray-300 py-2">
              <div className="flex items-center mb-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${steps.find(step => step.id === 5)?.bgColor} text-white mr-3 flex-shrink-0`}>
                  <FaStore className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-800">{steps.find(step => step.id === 5)?.name}</span>
              </div>
            </div>

            {/* Site and final step */}
            <div className="flex items-center mt-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${steps.find(step => step.id === 6)?.bgColor} text-white mr-4 flex-shrink-0`}>
                <FaTruck className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-800">{steps.find(step => step.id === 6)?.name}</span>
            </div>

            <div className="flex items-center mt-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${steps.find(step => step.id === 7)?.bgColor} text-white mr-4 flex-shrink-0`}>
                <FaCheck className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-800">{steps.find(step => step.id === 7)?.name}</span>
            </div>
          </div>
        </div>

        {/* Legend Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-gray-200 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">i</span>
            Process Legend
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div key={step.id} className="border-l-4 border-gray-500 pl-4 py-1">
                <div className="flex items-start">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full mr-3 flex-shrink-0 mt-1
                    ${step.bgColor}
                    text-white text-sm
                  `}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{step.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Path Explanations */}
            <div className="border-l-4 border-gray-500 pl-4 py-1 md:col-span-2">
              <h4 className="font-semibold text-gray-800 mb-2">Process Paths</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5 mr-2"></div>
                  <div>
                    <h5 className="font-medium text-gray-700">Storage Path</h5>
                    <p className="text-gray-600 text-sm">Inspection → Store → Site → Live/Inventory</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5 mr-2"></div>
                  <div>
                    <h5 className="font-medium text-gray-700">Direct Path</h5>
                    <p className="text-gray-600 text-sm">Inspection → Direct to → Site → Live/Inventory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">How it Works?</h3>
          <strong>You as an Inspection Incharge</strong>
          <ul className="list-disc list-inside">
            <li className="mb-2">You have to initiate an inspection (click <b>+Inspection</b> in drawer) of purchase order asked for to start the process and send the inspection to the Data Operator to fill in the details.(Images: Image-1 & Image-2)</li>
            <div className="flex flex-wrap justify-center gap-2">
            <figure className="my-4 text-center">
              <img
                src={addInspection}
                alt="add inspection"
                className="mx-auto rounded-md shadow-md"
              />
              <figcaption className="mt-2 text-sm text-gray-600">
                Image-1
              </figcaption>
            </figure>
            <figure className="my-4 text-center">
              <img
                src={createInspection}
                alt="createInspection"
                className="mx-auto rounded-md shadow-md"
              />
              <figcaption className="mt-2 text-sm text-gray-600">
                Image-2
              </figcaption>
            </figure>
            </div>
            <li className="mb-2">The Data Operator will fill the details whose request received in <b>Item Requests</b> section of dashboard and upload its certificate and send back to the inspection incharge for approval.</li>
            <div>
            <figure className="my-4 text-center">
              <img
                src={addItemsDashboard}
                alt="addItemsDashboard"
                className="mx-auto rounded-md shadow-md"
              />
              <figcaption className="mt-2 text-sm text-gray-600">
                Image-3
              </figcaption>
            </figure>
            <figure className="my-4 text-center">
              <img
                src={addItemTable}
                alt="add items request table"
                className="mx-auto rounded-md shadow-md"
              />
              <figcaption className="mt-2 text-sm text-gray-600">
                Image-4
              </figcaption>
            </figure>
            <figure className="my-4 text-center">
              <img
                src={addItemForm}
                alt="add items request form"
                className="mx-auto rounded-md shadow-md"
              />
              <figcaption className="mt-2 text-sm text-gray-600">
                Image-5
              </figcaption>
            </figure>
            </div>
            <li className="mb-2">The inspection incharge will review the details and approve the Line Items and will dispatch the items to the respective sites or stores to which the items are bound.</li>
          </ul>
          <strong>You as an Store Incharge</strong>
          <ul className="list-disc list-inside">
            <li className="mb-2">You will receive items sent by the inspection incharge or other store in <b>Store section</b>  of dashboard.</li>
            <li className="mb-2">Accept the item/s (Click on <b>Accept Me</b> button).</li>
            <li className="mb-2">Dispatch the item/s to the sites or other store for which item bound to (Click on <b>Dispatch</b> button).</li>
          </ul>
          <strong>You as an Site Incharge</strong>
          <ul className="list-disc list-inside">
            <li className="mb-2">You will receive items sent by the Inspection Incharge or Store Incharge in <b>At Site section</b>  of dashboard.</li>
            <li className="mb-2">Accept the item/s (Click on <b>Accept Me</b> button).</li>
            <li className="mb-2">Send the item/s to the Inventory or send for Live (Click on <b>Send</b> button).</li>
          </ul>
          <strong>You as an Inventory Incharge</strong>
          <ul className="list-disc list-inside">
            <li className="mb-2">You will receive items sent by the Site Incharge in <b>Inventory section</b>  of dashboard.</li>
            <li className="mb-2">Send the item/s to the Live (Click on <b>Live</b> button).</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">How Rejects handled?</h3>
          <strong>Rejection while Inspection</strong>
          <p>Data operator will receive rejected Line Item/s in <b>Re-Fill</b> section of dashboard. Data Operator will review reason of rejection and make changes accordingly.</p>
          <strong className="mt-2">Rejection at Store</strong>
          <p>Inspection Incharge will receive rejected Item/s in <b>Store Rejects</b> section of dashboard. Inspection Incharge will review the reason of rejection and dispatch item/s again accordingly.</p>
          <strong>Rejection at Site</strong>
          <p>Previous owner (Inspection Incharge or Store Incharge) will receive rejected Item/s in <b>Site Rejects</b> section of dashboard. Previous owner will review the reason of rejection and dispatch item/s again accordingly.</p>
        </div>
      </div>
    </div>
  );
};