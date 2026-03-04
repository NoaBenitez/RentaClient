import { FileUpload } from "./FileUpload";

interface ArticlesPurchaseUploadProps {
  onFileSelect: (file: File) => void;
  isUploaded: boolean;
  fileName: string;
}

export const ArticlesPurchaseUpload = ({ onFileSelect, isUploaded, fileName }: ArticlesPurchaseUploadProps) => {
  return (
    <FileUpload
      label="Articles en Stock (Achat)"
      onFileSelect={onFileSelect}
      isUploaded={isUploaded}
      fileName={fileName}
    />
  );
};
