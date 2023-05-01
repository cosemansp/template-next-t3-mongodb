import type { NextApiRequest, NextApiResponse } from "next";
import { convertHTMLToPDF } from "@cityssm/pdf-puppeteer";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  await convertHTMLToPDF(
    "https://react.dev/",
    (pdf) => {
      res.setHeader("Content-Type", "application/pdf");
      // add this if you want to download the pdf
      // res.setHeader("Content-Disposition", "attachment; filename=react.pdf");
      res.send(pdf);
    },
    {
      // https://pptr.dev/api/puppeteer.pdfoptions
      format: "A4",
      printBackground: true,
    },
    {
      // puppeteerLaunchOptions,
    },
    {
      // pdfPuppeteerOptions
      htmlIsUrl: true,
    }
  );
}
