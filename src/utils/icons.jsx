import React from 'react'

export function AddSquare(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 11c0-3.771 0-5.657 1.172-6.828S7.229 3 11 3h2c3.771 0 5.657 0 6.828 1.172S21 7.229 21 11v2c0 3.771 0 5.657-1.172 6.828S16.771 21 13 21h-2c-3.771 0-5.657 0-6.828-1.172S3 16.771 3 13z"></path>
        <path
          strokeLinecap="square"
          strokeLinejoin="round"
          d="M12 8v8m4-4H8"
        ></path>
      </g>
    </svg>
  )
}
export function DownArrow(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.47 9.4a.75.75 0 0 1 1.06 0l6.364 6.364a.25.25 0 0 0 .354 0L18.612 9.4a.75.75 0 0 1 1.06 1.06l-6.364 6.364a1.75 1.75 0 0 1-2.475 0L4.47 10.46a.75.75 0 0 1 0-1.06"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export function Edit(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 text-blue-500 p-1 rounded-md hover:bg-blue-100 transition duration-200"
      viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
  )
}

export function DeleteIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className='h-8 w-8 text-red-500 p-1 rounded-md hover:bg-red-100 transition duration-200'
      fill="none"
      {...props}
    >
      <path
        fill="currentColor"
        d="M16 9v10H8V9zm-1.5-6h-5l-1 1H5v2h14V4h-3.5zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2z"
      ></path>
    </svg>
  )
}

export function RoundAddCircle(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className='h-5 w-5'
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 7c-.55 0-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V8c0-.55-.45-1-1-1m0-5C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8"
      ></path>
    </svg>
  )
}

export function DraftOrders(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className='w-6 h-6'
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m-4-4v-3.075l5.525-5.5q.225-.225.5-.325t.55-.1q.3 0 .575.113t.5.337l.925.925q.2.225.313.5t.112.55t-.1.563t-.325.512l-5.5 5.5zm6.575-5.6l.925-.975l-.925-.925l-.95.95z"
      ></path>
    </svg>
  )
}


export function UploadIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className='h-7 w-7 text-blue-600  hover:bg-blue-100 hover:text-blue-700 p-1 rounded-md transition duration-200'
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 3a1 1 0 0 1 .78.375l4 5a1 1 0 1 1-1.56 1.25L13 6.85V14a1 1 0 1 1-2 0V6.85L8.78 9.626a1 1 0 1 1-1.56-1.25l4-5A1 1 0 0 1 12 3M9 14v-1H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4v1a3 3 0 1 1-6 0m8 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export function StatusChange(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M4 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0m12 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6 12v-2a6 6 0 1 1 12 0v2"></path>
        <path d="m15 9l3 3l3-3"></path>
      </g>
    </svg>
  )
}

export function Inspection(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 26"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M13 0c-.7 0-1.206.294-1.406.594c-.1.1-.181.306-.281.406H10c-1.1 0-2 .9-2 2H6C4.3 3 3 4.3 3 6v17c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3h-2c0-1.1-.9-2-2-2h-1.313c-.1-.1-.18-.306-.28-.406C14.206.294 13.7 0 13 0m-3 3h6v2h-6zM6 6h2.313c.3.6.987 1 1.687 1h6c.7 0 1.387-.4 1.688-1H20v17H6zm10.563 4.688c-.188 0-.37.068-.47.218l-4.405 4.688L10 14c-.3-.3-.8-.3-1 0l-.688.688c-.3.3-.3.8 0 1l2.782 2.624c.4.4 1.006.275 1.406-.125l5.406-5.78c.2-.2.207-.607-.093-.907l-.72-.594a.75.75 0 0 0-.53-.219z"
      ></path>
    </svg>
  )
}



export function Transaction(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className='h-5 w-5'
      {...props}
    >
      <defs>
        <mask id="ipSTransaction0">
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          >
            <path
              fill="#fff"
              stroke="#fff"
              d="M39 6H9a3 3 0 0 0-3 3v30a3 3 0 0 0 3 3h30a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3"
            ></path>
            <path stroke="#000" d="m21 31l5 4l8-10M14 15h20m-20 8h8"></path>
          </g>
        </mask>
      </defs>
      <path
        fill="currentColor"
        d="M0 0h48v48H0z"
        mask="url(#ipSTransaction0)"
      ></path>
    </svg>
  )
}

export function CicsSitOverrides(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="m31.707 20.293l-3-3a1 1 0 0 0-1.414 0L18 26.586V31h4.414l9.293-9.293a1 1 0 0 0 0-1.414m-7.414 6L21.586 29H20v-1.586l2.707-2.707L25 22.414L26.586 24zM28 22.586L26.414 21L28 19.414L29.586 21zM20 20v-2h-4v-7h10v2h2V6c0-1.654-1.346-3-3-3H5C3.346 3 2 4.346 2 6v20c0 1.654 1.346 3 3 3h11v-9zm-6-2H4v-7h10zM5 5h20a1 1 0 0 1 1 1v3H4V6a1 1 0 0 1 1-1m9 22H5a1 1 0 0 1-1-1v-6h10z"
      ></path>
    </svg>
  )
}

export function ReportFormsFill(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-6 h-6 text-gray-500 hover:text-gray-700"
      {...props}
    >
      <g fill="none">
        <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"></path>
        <path
          fill="currentColor"
          d="M10 21h9a2 2 0 0 0 2-2v-2H10zm0-6h11v-5H10zm-2-5v5H3v-5zm2-2h11V6a2 2 0 0 0-2-2h-9zM8 4v4H3V6a2 2 0 0 1 2-2zm0 13v4H5a2 2 0 0 1-2-2v-2z"
        ></path>
      </g>
    </svg>
  )
}

export function UserCircleSolid(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-6 h-6 text-gray-600 hover:text-gray-800"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 20a7.97 7.97 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.97 7.97 0 0 1 12 20M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12m10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export function ProfileDuotone(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-6 h-6 text-gray-600 hover:text-gray-700"
      {...props}
    >
      <g fill="none">
        <path
          fill="currentColor"
          d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2"
          opacity=".16"
        ></path>
        <path
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"
        ></path>
        <circle
          cx="12"
          cy="7"
          r="3"
          stroke="currentColor"
          strokeWidth="2"
        ></circle>
      </g>
    </svg>
  )
}


export function Name(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 26"
      className="w-5 h-5 text-gray-600"
      {...props}
    >
      <path
        fill="currentColor"
        d="M16.563 15.9c-.159-.052-1.164-.505-.536-2.414h-.009c1.637-1.686 2.888-4.399 2.888-7.07c0-4.107-2.731-6.26-5.905-6.26c-3.176 0-5.892 2.152-5.892 6.26c0 2.682 1.244 5.406 2.891 7.088c.642 1.684-.506 2.309-.746 2.397c-3.324 1.202-7.224 3.393-7.224 5.556v.811c0 2.947 5.714 3.617 11.002 3.617c5.296 0 10.938-.67 10.938-3.617v-.811c0-2.228-3.919-4.402-7.407-5.557"
      ></path>
    </svg>
  )
}

export function EmailIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-5 h-5 text-gray-600"
      {...props}
    >
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
      ></path>
    </svg>
  )
}

export function OnSubmitLoading() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}

export function Warning(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      {...props}
    >
      <g fill="none" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeWidth="2"
          d="M16 18v-6M6.358 27h19.284c1.516 0 2.48-1.62 1.759-2.953l-9.642-17.8c-.757-1.397-2.761-1.397-3.518 0L4.6 24.047C3.877 25.38 4.842 27 6.358 27Z"
        ></path>
        <path
          fill="currentColor"
          d="M17 21.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"
        ></path>
      </g>
    </svg>
  )
}

export function TaskApproved(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className="w-5 h-5 text-green-600 hover:bg-green-100 hover:text-green-700 rounded text-sm"
      {...props}
    >
      <path
        fill="currentColor"
        d="M30 20a6 6 0 1 0-10 4.46V32l4-1.894L28 32v-7.54A5.98 5.98 0 0 0 30 20m-4 8.84l-2-.947l-2 .947v-3.19a5.9 5.9 0 0 0 4 0ZM24 24a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"
      ></path>
      <path
        fill="currentColor"
        d="M25 5h-3V4a2.006 2.006 0 0 0-2-2h-8a2.006 2.006 0 0 0-2 2v1H7a2.006 2.006 0 0 0-2 2v21a2.006 2.006 0 0 0 2 2h9v-2H7V7h3v3h12V7h3v5h2V7a2.006 2.006 0 0 0-2-2m-5 3h-8V4h8Z"
      ></path>
    </svg>
  )
}

export function Pdf01(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-8 h-8 text-blue-500 hover:bg-blue-100 hover:text-blue-700 p-1 rounded transition duration-200"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        color="currentColor"
      >
        <path d="M3.5 13v-.804c0-2.967 0-4.45.469-5.636c.754-1.905 2.348-3.407 4.37-4.118C9.595 2 11.168 2 14.318 2c1.798 0 2.698 0 3.416.253c1.155.406 2.066 1.264 2.497 2.353c.268.677.268 1.525.268 3.22V13"></path>
        <path d="M3.5 12a3.333 3.333 0 0 1 3.333-3.333c.666 0 1.451.116 2.098-.057a1.67 1.67 0 0 0 1.179-1.18c.173-.647.057-1.432.057-2.098A3.333 3.333 0 0 1 13.5 2m-10 20v-3m0 0v-1.8c0-.566 0-.848.176-1.024C3.85 16 4.134 16 4.7 16h.8a1.5 1.5 0 0 1 0 3zm17-3H19c-.943 0-1.414 0-1.707.293S17 17.057 17 18v1m0 3v-3m0 0h2.5M14 19a3 3 0 0 1-3 3c-.374 0-.56 0-.7-.08c-.333-.193-.3-.582-.3-.92v-4c0-.338-.033-.727.3-.92c.14-.08.326-.08.7-.08a3 3 0 0 1 3 3"></path>
      </g>
    </svg>
  )
}

export function CloudUpload(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5c0-2.64-2.05-4.78-4.65-4.96M14 13v4h-4v-4H7l5-5l5 5z"
      ></path>
    </svg>
  )
}



export function Store(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M464 448V267.85a104.8 104.8 0 0 1-33.56 6.58c-1.18 0-2.3.05-3.4.05a108 108 0 0 1-56.86-16a108 108 0 0 1-56.85 16a106.16 106.16 0 0 1-56.51-16.2a107.84 107.84 0 0 1-57.2 16.2a106.14 106.14 0 0 1-56.85-16.42a106.14 106.14 0 0 1-56.85 16.42c-1.09 0-2.19 0-3.37-.05h-.06A104.7 104.7 0 0 1 48 267.49V448H16v32h480v-32Zm-240-64h-96v-76a4 4 0 0 1 4-4h88a4 4 0 0 1 4 4Zm160 64h-80V308a4 4 0 0 1 4-4h72a4 4 0 0 1 4 4Zm108.57-277.72L445.89 64C432 32 432 32 400 32H112c-32 0-32 0-45.94 32L19.38 170.28c-9 19.41 2.89 39.34 2.9 39.35l.41.66c.42.66 1.13 1.75 1.62 2.37c.1.13.19.27.28.4l5.24 6.39l5.31 5.14l.42.36a69.7 69.7 0 0 0 9.44 6.78v.05a74 74 0 0 0 36 10.67h2.47a76.08 76.08 0 0 0 51.89-20.31a72 72 0 0 0 5.77-6a74 74 0 0 0 5.78 6a76.08 76.08 0 0 0 51.89 20.31c23.28 0 44.07-10 57.63-25.56a.11.11 0 0 1 .15 0l5.66 5.26a76.1 76.1 0 0 0 51.9 20.31c23.29 0 44.11-10 57.66-25.61c13.56 15.61 34.37 25.61 57.67 25.61h2.49a71.35 71.35 0 0 0 35-10.7c.95-.57 1.86-1.17 2.78-1.77A71.3 71.3 0 0 0 488 212.17l2-3c.9-2.04 11.21-20.3 2.57-38.89"
      ></path>
    </svg>
  )
}

export function StoreRemove02(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M2.997 10.494v4.503c0 2.83 0 4.245.879 5.124c.878.88 2.293.88 5.121.88h3.5m8.5-10.507v2.502m-14 3.994h4m5-.992l3 3.002m0 0l3 3.001m-3-3.001l-3 3.001m3-3.001l3-3.002M17.795 2.001L6.149 2.03c-1.738-.085-2.184 1.187-2.184 1.81c0 .556-.075 1.367-1.14 2.891c-1.066 1.524-.986 1.977-.385 3.032c.498.876 1.766 1.218 2.428 1.276A2.983 2.983 0 0 0 7.99 8.147c1.042 3.045 4.005 3.045 5.325 2.697c1.323-.349 2.456-1.598 2.723-2.697c.156 1.366.63 2.163 2.027 2.711c1.448.568 2.694-.3 3.319-.856s1.026-1.79-.088-3.146c-.768-.936-1.089-1.817-1.194-2.73c-.06-.53-.114-1.099-.506-1.46c-.572-.53-1.393-.69-1.801-.665"
        color="currentColor"
      ></path>
    </svg>
  )
}


export function SearchCircle(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M256 64C150.13 64 64 150.13 64 256s86.13 192 192 192s192-86.13 192-192S361.87 64 256 64m80 294.63l-54.15-54.15a88.08 88.08 0 1 1 22.63-22.63L358.63 336Z"
      ></path>
      <circle cx="232" cy="232" r="56" fill="currentColor"></circle>
    </svg>
  )
}

export function ParcelTracker(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.339 23.276v10.767l15.654 2.941V13.519"
      ></path>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M39.562 23.561v10.294l-15.569 3.129"
      ></path>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m28.775 22.075l13.386 1.844a1.176 1.176 0 0 0 1.236-1.643l-3.835-8.632l-15.57-2.628L8.34 13.77l-3.73 8.016a1.176 1.176 0 0 0 1.149 1.67l13.338-.927a1.47 1.47 0 0 0 1.24-.865l3.655-8.144l3.653 7.727a1.47 1.47 0 0 0 1.129.828m-17.87 8.589l2.941.313"
      ></path>
    </svg>
  )
}


export function CartCrossBroken(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7.5 18a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Zm9 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3Z"></path>
        <path
          strokeLinecap="round"
          d="m11.5 12.5l3-3m0 3l-3-3M2 3l.261.092c1.302.457 1.953.686 2.325 1.231s.372 1.268.372 2.715V9.76c0 2.942.063 3.912.93 4.826c.866.914 2.26.914 5.05.914H12m4.24 0c1.561 0 2.342 0 2.894-.45c.551-.45.709-1.214 1.024-2.743l.5-2.424c.347-1.74.52-2.609.076-3.186c-.443-.577-1.96-.577-3.645-.577h-6.065m-6.066 0H7"
        ></path>
      </g>
    </svg>
  )
}

export function PreviewFill(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M10 22H8.75A6.76 6.76 0 0 1 2 15.25v-6.5A6.76 6.76 0 0 1 8.75 2h6.5A6.76 6.76 0 0 1 22 8.75V10a.75.75 0 1 1-1.5 0V8.75a5.26 5.26 0 0 0-5.25-5.25h-6.5A5.26 5.26 0 0 0 3.5 8.75v6.5a5.26 5.26 0 0 0 5.25 5.25H10a.75.75 0 1 1 0 1.5"
      ></path>
      <path
        fill="currentColor"
        d="M21.52 14.53a1.89 1.89 0 0 1-1.48 1.76l-3.16.52l-.09.09a.4.4 0 0 0-.09.14l-.5 2.91a1.94 1.94 0 0 1-.68 1.06a1.9 1.9 0 0 1-1.1.41h-.09a1.94 1.94 0 0 1-1.79-1.24l-2.79-7.9a1.9 1.9 0 0 1 .45-2a1.8 1.8 0 0 1 .94-.51a1.87 1.87 0 0 1 1.07.07l8 2.78a1.93 1.93 0 0 1 1.29 1.91z"
      ></path>
    </svg>
  )
}

export function Live(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6.343 4.938a1 1 0 0 1 0 1.415a8.003 8.003 0 0 0 0 11.317a1 1 0 1 1-1.414 1.414c-3.907-3.906-3.907-10.24 0-14.146a1 1 0 0 1 1.414 0m12.732 0c3.906 3.907 3.906 10.24 0 14.146a1 1 0 0 1-1.415-1.414a8.003 8.003 0 0 0 0-11.317a1 1 0 0 1 1.415-1.415M9.31 7.812a1 1 0 0 1 0 1.414a3.92 3.92 0 0 0 0 5.544a1 1 0 1 1-1.415 1.414a5.92 5.92 0 0 1 0-8.372a1 1 0 0 1 1.415 0m6.958 0a5.92 5.92 0 0 1 0 8.372a1 1 0 0 1-1.414-1.414a3.92 3.92 0 0 0 0-5.544a1 1 0 0 1 1.414-1.414m-4.186 2.77a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3"
      ></path>
    </svg>
  )
}
