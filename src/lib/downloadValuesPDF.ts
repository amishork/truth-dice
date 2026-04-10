import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures a DOM element and downloads it as a letter-size PDF.
 * The element should be rendered at 816x1056px (96dpi letter) for crisp output.
 */
export async function downloadValuesPDF(elementId: string, filename = "my-core-values.pdf"): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);

  // Make visible for capture if hidden
  const prevVisibility = el.style.visibility;
  const prevPosition = el.style.position;
  el.style.visibility = "visible";
  el.style.position = "fixed";
  el.style.left = "-9999px";
  el.style.top = "0";

  try {
    const canvas = await html2canvas(el, {
      scale: 2,            // 2x for retina-quality print
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    // Letter size: 8.5 x 11 inches
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter",
    });

    pdf.addImage(imgData, "JPEG", 0, 0, 8.5, 11);
    pdf.save(filename);
  } finally {
    el.style.visibility = prevVisibility;
    el.style.position = prevPosition;
    el.style.left = "";
    el.style.top = "";
  }
}
