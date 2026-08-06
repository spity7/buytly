import React from "react";

const InvoiceFooter = () => {
  const footerData = [
    {
      text: "www.Buytly.com",
      link: "https://www.Buytly.com",
    },
    {
      text: "invoice@Buytly.com",
      link: "mailto:invoice@Buytly.com",
    },
    {
      text: "(123) 123-456",
      link: "tel:+1123123456",
    },
  ];

  return (
    <>
      {footerData.map((data, index) => (
        <div className="col-auto" key={index}>
          <div className="invoice_footer_content text-center">
            <a className="ff-heading" href={data.link}>
              {data.text}
            </a>
          </div>
        </div>
      ))}
    </>
  );
};

export default InvoiceFooter;
