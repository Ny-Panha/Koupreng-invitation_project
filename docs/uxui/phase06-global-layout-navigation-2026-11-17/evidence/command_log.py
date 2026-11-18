"""Read both Windows PowerShell Tee-Object UTF-16 logs and UTF-8 tool logs."""
def read_command_log(root,row):
    name=row.get('log')
    if not name:return ''
    path=root/name
    if not path.is_file():return ''
    data=path.read_bytes()
    return data.decode('utf-16' if data[:2] in (b'\xff\xfe',b'\xfe\xff') else 'utf-8-sig',errors='replace')
