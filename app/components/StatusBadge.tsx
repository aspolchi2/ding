interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' }
      case 'PREPARING':
        return { label: 'Preparando', className: 'bg-blue-100 text-blue-800' }
      case 'READY':
        return { label: 'Listo', className: 'bg-green-100 text-green-800' }
      case 'RETRIEVED':
        return { label: 'Entregado', className: 'bg-zinc-100 text-zinc-800' }
      default:
        return { label: status, className: 'bg-zinc-100 text-zinc-800' }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}