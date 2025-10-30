import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload = ({ onFileSelect, isLoading }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast.error("Por favor, selecione um arquivo Excel válido (.xlsx, .xls)");
        return;
      }

      const file = acceptedFiles[0];
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (!validTypes.includes(file.type)) {
        toast.error("Formato inválido. Por favor, envie um arquivo Excel (.xlsx, .xls)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <Card
      {...getRootProps()}
      className={`relative overflow-hidden transition-all duration-300 ${
        isDragActive
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-dashed hover:border-primary hover:bg-accent/30"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      style={{
        background: isDragActive ? "linear-gradient(135deg, hsl(217 91% 35% / 0.05) 0%, hsl(217 91% 50% / 0.05) 100%)" : undefined,
      }}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-4">
        <div
          className={`p-6 rounded-full transition-transform duration-300 ${
            isDragActive ? "scale-110" : ""
          }`}
          style={{
            background: "var(--gradient-primary)",
          }}
        >
          <Upload className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            {isLoading
              ? "Processando..."
              : isDragActive
              ? "Solte o arquivo aqui"
              : "Envie seu arquivo Excel"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {isLoading
              ? "Analisando seus dados financeiros com IA..."
              : "Arraste e solte ou clique para selecionar um arquivo de fluxo de caixa (.xlsx, .xls)"}
          </p>
        </div>
        {!isLoading && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Selecionar Arquivo
          </Button>
        )}
      </div>
    </Card>
  );
};
