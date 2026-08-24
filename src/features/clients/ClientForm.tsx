import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientInput, type ClientPayload } from "./schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin, User, Home, FileText } from "lucide-react";

interface Props {
  defaultValues?: Partial<ClientInput>;
  submitLabel?: string;
  onSubmit: (values: ClientPayload) => Promise<void> | void;
  onCancel?: () => void;
}

const UF = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

interface ViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export function ClientForm({ defaultValues, submitLabel = "Salvar", onSubmit, onCancel }: Props) {
  const form = useForm<ClientInput, unknown, ClientPayload>({
    resolver: zodResolver(clientSchema) as never,
    defaultValues: {
      name: "",
      company_name: "",
      status: "lead",
      email: "",
      cpf: "",
      phone: "",
      whatsapp: "",
      instagram: "",
      zip: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      reference: "",
      city: "",
      state: "",
      notes: "",
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const [cepLoading, setCepLoading] = useState(false);

  async function lookupCep() {
    const raw = String(getValues("zip") ?? "").replace(/\D/g, "");
    if (raw.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      if (!res.ok) return;
      const d = (await res.json()) as ViaCep;
      if (d.erro) return;
      if (d.logradouro) setValue("street", d.logradouro, { shouldValidate: false });
      if (d.bairro) setValue("district", d.bairro, { shouldValidate: false });
      if (d.localidade) setValue("city", d.localidade, { shouldValidate: false });
      if (d.uf) setValue("state", d.uf, { shouldValidate: false });
    } catch {
      // silencioso
    } finally {
      setCepLoading(false);
    }
  }

  const field = (name: keyof ClientInput, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <Input id={name} {...register(name)} {...extra} className="h-9" />
      {errors[name] ? <p className="text-xs text-destructive">{errors[name]?.message as string}</p> : null}
    </div>
  );

  const statusValue = watch("status");
  const stateValue = watch("state");

  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        await onSubmit(v);
      })}
      className="flex flex-col"
    >
      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dados"><User className="mr-1.5 size-3.5" /> Dados</TabsTrigger>
          <TabsTrigger value="endereco"><Home className="mr-1.5 size-3.5" /> Endereço</TabsTrigger>
          <TabsTrigger value="obs"><FileText className="mr-1.5 size-3.5" /> Obs</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {field("name", "Nome completo *")}
            {field("company_name", "Empresa")}
            <div className="space-y-1">
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select
                value={statusValue}
                onValueChange={(v) => setValue("status", v as ClientInput["status"], { shouldValidate: true })}
              >
                <SelectTrigger id="status" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Cliente Ativo</SelectItem>
                  <SelectItem value="inactive">Cliente Inativo</SelectItem>
                  <SelectItem value="lost">Cliente Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {field("email", "E-mail", { type: "email", placeholder: "contato@exemplo.com" })}
            {field("cpf", "CPF", { placeholder: "000.000.000-00", inputMode: "numeric" })}
            {field("phone", "Telefone", { placeholder: "(11) 99999-9999", inputMode: "tel" })}
            {field("whatsapp", "WhatsApp", { placeholder: "(11) 99999-9999", inputMode: "tel" })}
            {field("instagram", "Instagram", { placeholder: "@usuario" })}
          </div>
        </TabsContent>

        <TabsContent value="endereco" className="mt-3 space-y-3">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <MapPin className="size-3.5" /> Endereço
            </p>
            <div className="grid gap-3 sm:grid-cols-6">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="zip" className="text-xs">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    id="zip"
                    placeholder="00000-000"
                    inputMode="numeric"
                    {...register("zip")}
                    onBlur={lookupCep}
                    className="h-9"
                  />
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={lookupCep} disabled={cepLoading} title="Buscar CEP">
                    {cepLoading ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                  </Button>
                </div>
                {errors.zip ? <p className="text-xs text-destructive">{errors.zip.message}</p> : null}
              </div>
              <div className="space-y-1 sm:col-span-3">
                <Label htmlFor="street" className="text-xs">Rua</Label>
                <Input id="street" {...register("street")} className="h-9" />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="number" className="text-xs">Número</Label>
                <Input id="number" {...register("number")} className="h-9" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="complement" className="text-xs">Complemento</Label>
                <Input id="complement" {...register("complement")} className="h-9" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="district" className="text-xs">Bairro</Label>
                <Input id="district" {...register("district")} className="h-9" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="city" className="text-xs">Cidade</Label>
                <Input id="city" {...register("city")} className="h-9" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="state" className="text-xs">UF</Label>
                <Select
                  value={stateValue || ""}
                  onValueChange={(v) => setValue("state", v, { shouldValidate: true })}
                >
                  <SelectTrigger id="state" className="h-9 w-full">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {UF.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state ? <p className="text-xs text-destructive">{errors.state.message}</p> : null}
              </div>
              <div className="space-y-1 sm:col-span-6">
                <Label htmlFor="reference" className="text-xs">Referência</Label>
                <Input id="reference" {...register("reference")} className="h-9" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="obs" className="mt-3 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs">Observações</Label>
            <Textarea id="notes" rows={5} {...register("notes")} />
            {errors.notes ? <p className="text-xs text-destructive">{errors.notes.message}</p> : null}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
