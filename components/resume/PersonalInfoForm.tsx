"use client";

import { useState, useEffect } from "react";
import { PersonalInfo, Skill, Experience, Education } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PersonalInfoFormProps {
  resumeId: string;
  initialData?: PersonalInfo | null;
  onSave: (data: PersonalInfo) => void;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
}

export default function PersonalInfoForm({
  resumeId,
  initialData,
  onSave,
  skills,
  experiences,
  educations,
}: PersonalInfoFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [linkedin, setLinkedin] = useState(initialData?.linkedin || "");
  const [github, setGithub] = useState(initialData?.github || "");
  const [portfolio, setPortfolio] = useState(initialData?.portfolio || "");
  const [profilePicture, setProfilePicture] = useState(
    initialData?.profilePicture || ""
  );
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
      setLinkedin(initialData.linkedin || "");
      setGithub(initialData.github || "");
      setPortfolio(initialData.portfolio || "");
      setProfilePicture(initialData.profilePicture || "");
      setSummary(initialData.summary || "");
    }
  }, [initialData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione uma imagem para upload.");
      return;
    }

    setUploadingImage(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.url); // Update profile picture URL with the uploaded one
        setSuccess("Imagem enviada com sucesso!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao enviar imagem");
      }
    } catch (err: unknown) {
      setError(err.message);
      console.error("Erro ao enviar imagem:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const dataToSave = {
      fullName,
      email,
      phone,
      address,
      linkedin,
      github,
      portfolio,
      profilePicture,
      summary,
    };

    try {
      const method = initialData ? "PUT" : "POST";
      const url = `/api/resumes/${resumeId}/personal-info`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar informações pessoais");
      }

      const savedData: PersonalInfo = await response.json();
      onSave(savedData);
      setSuccess("Informações pessoais salvas com sucesso!");
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao salvar informações pessoais:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <div>
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          type="text"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="address">Endereço</Label>
        <Input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="linkedin">URL do Perfil do LinkedIn</Label>
        <Input
          type="url"
          id="linkedin"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="github">URL do Perfil do GitHub</Label>
        <Input
          type="url"
          id="github"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="portfolio">URL do Site do Portfólio</Label>
        <Input
          type="url"
          id="portfolio"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="profilePicture">Foto de Perfil</Label>
        <div className="flex items-center mt-1">
          <Input
            type="file"
            id="profilePictureFile"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            onClick={handleImageUpload}
            disabled={!selectedFile || uploadingImage}
            className="ml-2"
          >
            {uploadingImage ? "Enviando..." : "Enviar Imagem"}
          </Button>
        </div>
        {profilePicture && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Imagem Atual:</p>
            <img src={profilePicture} alt="Profile" className="w-24 h-24 object-cover rounded-full mt-1" />
            <p className="text-xs text-gray-500 break-all">{profilePicture}</p>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="summary">Resumo/Sobre Mim</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
        />
        <Button
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: `Escreva um resumo profissional conciso para um currículo em português. Não use negrito. Habilidades principais: ${skills.map(s => s.name).join(', ')}. Experiência: ${experiences.map(e => e.title + ' na ' + e.company).join(', ')}. Educação: ${educations.map(e => e.degree + ' de ' + e.institution).join(', ')}.` }),
              });
              const data = await response.json();
              setSummary(data.text);
            } catch (err: unknown) {
              setError("Falha ao gerar resumo com IA.");
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="mt-2"
        >
          {loading ? "Gerando..." : "Gerar com IA"}
        </Button>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar Informações Pessoais"}
      </Button>
    </form>
  );
}
