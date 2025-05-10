import { cloneClassArray, ITargetRow, Mutation, MutationType, TargetRow } from "jde-framework";

export type OpcServerPK = number;
export type OpcServerTarget = string;
export class OpcServer extends TargetRow<OpcServer>{
	constructor( obj:any ){
		super(OpcServer.typeName, obj);
		this.url = obj.url;
		this.certificateUri = obj.certificateUri;
	}

	override equals( row:ITargetRow ):boolean{
		let other = row as OpcServer;
		return super.equals(row) && this.url==other.url && this.certificateUri==other.certificateUri;
	}

	override mutation( original:OpcServer ):Mutation[]{
		console.assert( this.canSave );
		let args = super.mutationArgs( original );
		if( this.url!=original?.url )
			args["url"] = this.url;
		if( this.certificateUri!=original?.certificateUri )
			args["certificateUri"] = this.certificateUri;
		return Object.keys( args ).length ? [new Mutation(this.type, this.id, args, original?.id ? MutationType.Update : MutationType.Create)] : [];
	}


	get properties():OpcServer{ let properties = new OpcServer(this); return properties; }
	url:string;
	certificateUri:string;
	static typeName = "OpcServer";
}